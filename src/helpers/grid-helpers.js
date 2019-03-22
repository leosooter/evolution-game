import {sum, sample, shuffle, clamp, mean, sortBy, sortedIndexBy, round, remove, cloneDeep} from "lodash";
import {getGridColor, getGridPlantColor, colorTracker, randomColor} from "./color-helpers";
import {worldColorsGrid} from "../config/colors-config";
import {random, matchRangeToRange} from "./utilities";
import shortid from "shortid";
import gridMocks from "../../mocks/grid-mocks";
import {loadPlantArray, applySurvivalStatsToPlant, testPlant1, testPlant2, testPlant3} from "./animal-helpers/base-animals";
import {world} from "../store/state";

const directionArray = ["e", "s", "w", "n"];
const squareSideArray = ["e", "s", "w", "n", "ne", "nw", "se", "sw"];
const startingTemp = 100;
const EVAPORATION_RATE = .2;
let rainMultiplier = 1

let rejectedOnTemp = 0;
let rejectedOnPrecip = 0;
let rejectedOnDrought = 0;
let removedPlants = 0;
let successfulMutations = 0;

let plantCompetitionRuns = 0;
let totalRainApplied = 0;


let rainLeft;
let totalYears = 1;
let totalSeasons = 0;
let totalEvolutions = 0;
let lowestMinPrecipMutaion = {minPrecip: 100};
let lowestSurvivingMinPrecip = {minPrecip: 100};

let cornerRadius = 30;
let baseTemp = 100;
let seasonTemp = 100;
let mapHeight;
let mapWidth;
let mapZoomHeight;
let mapZoomWidth;
let isZoomed = false;

////////////////////////////////////////////////// Grid Utilities
function getRandomFromGrid() {
    let heightIndex = random(0, world.globalGrid.length - 1);
    let widthIndex = random(0, world.globalGrid[0].length - 1);

    return world.globalGrid[heightIndex][widthIndex]
}

function loopGrid(callBack, outerCallBack) {
    if (!typeof callback === "function") {
        console.warn("callback must be a function --- in loopGrid()");
    }

    let gridHeight = world.globalGrid.length;
    let gridWidth = world.globalGrid[0].length;

    for (let heightIndex = 0; heightIndex < gridHeight; heightIndex++) {
        outerCallBack && outerCallBack(world.globalGrid[heightIndex]);
        for (let widthIndex = 0; widthIndex < gridWidth; widthIndex++) {
            const squareId = world.globalGrid[heightIndex][widthIndex];
            const square = world.squaresObj[squareId];
            callBack(square);
        }
    }
}

function scanWest(callBack, outerCallBack) {
    let gridHeight = world.globalGrid.length;
    let gridWidth = world.globalGrid[0].length;

    for (let heightIndex = 0; heightIndex < gridHeight; heightIndex++) {
        outerCallBack && outerCallBack(world.globalGrid[heightIndex]);
        for (let widthIndex = gridWidth - 1; widthIndex >= 0; widthIndex--) {
            const squareId = world.globalGrid[heightIndex][widthIndex];
            const square = world.squaresObj[squareId];
            callBack(square);
        }
    }
}

function scanSouth(callBack, outerCallBack) {
    let gridHeight = world.globalGrid.length;
    let gridWidth = world.globalGrid[0].length;

    for (let widthIndex = 0; widthIndex < gridWidth; widthIndex++) {
        outerCallBack && outerCallBack(world.globalGrid[widthIndex]);
        for (let heightIndex = 0; heightIndex < gridHeight; heightIndex++) {
            const squareId = world.globalGrid[heightIndex][widthIndex];
            const square = world.squaresObj[squareId];
            callBack(square);
        }
    }
}

function scanNorth(callBack, outerCallBack) {
    let gridHeight = world.globalGrid.length;
    let gridWidth = world.globalGrid[0].length;

    for (let widthIndex = 0; widthIndex < gridWidth; widthIndex++) {
        outerCallBack && outerCallBack(world.globalGrid[widthIndex]);
        for (let heightIndex = gridHeight - 1; heightIndex >= 0; heightIndex--) {
            const squareId = world.globalGrid[heightIndex][widthIndex];
            const square = world.squaresObj[squareId];
            callBack(square);
        }
    }
}

function scanGridByDirection(direction="e", callBack, outerCallBack) {
    if (!typeof callback === "function") {
        console.warn("callback must be a function --- in scanGridByDirection()");
    }

    let scanFunctions = {
        "e": loopGrid,
        "w": scanWest,
        "s": scanSouth,
        "n": scanNorth
    }

    scanFunctions[direction](callBack, outerCallBack)
}

function traverseWest(originHeight, originWidth, layer, callBack) {
    let height = originHeight + layer;
    let startWidth = originWidth - layer;

    for (let index = startWidth; index <= originWidth + layer; index++) {
        const squareId = world.globalGrid[height] && world.globalGrid[height][index];
        if(squareId) {
            const square = world.squaresObj[squareId];
            callBack(square, layer);
        }
    }
}

function traverseEast(originHeight, originWidth, layer, callBack) {
    let height = originHeight - layer;
    let startWidth = originWidth + layer;

    for (let index = startWidth; index >= originWidth - layer; index--) {
        const squareId = world.globalGrid[height] && world.globalGrid[height][index];
        if (squareId) {
            const square = world.squaresObj[squareId];
            callBack(square, layer);
        }
    }
}

function traverseSouth(originHeight, originWidth, layer, callBack) {
    let width = originWidth + layer;
    let startHeight = originHeight - layer;

    for (let index = startHeight; index <= originHeight + layer; index++) {
        const squareId = world.globalGrid[index] && world.globalGrid[index][width];
        if (squareId) {
            const square = world.squaresObj[squareId];
            callBack(square, layer);
        }
    }
}

function traverseNorth(originHeight, originWidth, layer, callBack) {
    let width = originWidth - layer;
    let startHeight = originHeight + layer;

    for (let index = startHeight; index >= originHeight - layer; index--) {
        const squareId = world.globalGrid[index] && world.globalGrid[index][width];
        if (squareId) {
            const square = world.squaresObj[squareId];
            callBack(square, layer);
        }
    }
}


function spreadFromSquare(square, distance = 1, callBack) {
    const originHeight = square.heightIndex;
    const originWidth = square.widthIndex;

    let saftey = 100;
    let layer= 1;
    while (saftey > 0 && layer <= distance) {
        traverseWest(originHeight, originWidth, layer, callBack);
        traverseSouth(originHeight, originWidth, layer, callBack);
        traverseEast(originHeight, originWidth, layer, callBack);
        traverseNorth(originHeight, originWidth, layer, callBack);

        layer ++;
    }
}


///////////////////////////// Grid creation

export function newSquare(id, widthIndex, heightIndex, gridHeight, options={}) { // options param is used to generate set-value squares for mocks
    const {setElevation, setTemp, setPrecip} = options;

    let square = {
        avgElevation: setElevation || null,
        waterElevation: 0,
        precipitation: setPrecip || 0,
        totalPrecipArray: [0, 0, 0, 0],
        avgPrecipArray: [0, 0, 0, 0],

        baseTemp: setTemp || 0,
        totalTempArray: [0, 0, 0, 0],
        avgTempArray: [0, 0, 0, 0],

        id,
        latitude: heightIndex / gridHeight,
        widthIndex,
        heightIndex,
        allSidesArray: [],
        mainSidesArray: [],
        cornerStyles: {},
        n: null,
        s: null,
        e: null,
        w: null,
        nw: null,
        ne: null,
        sw: null,
        se: null,

        plants: [],

        plantTested: 0,
        plantRejectedForTemp: 0,
        plantRejectedForPrecip: 0,
        plantRejectedForScore: 0,
        plantRejectedForDrought: 0,

        plantRejectedForTempArray: [],
        plantRejectedForPrecipArray: [],
        plantRejectedForScoreArray: [],
        plantRejectedForDroughtArray: [],
    }

    return square;
}

function setRandomGlobalGrid(height, width) {
    let t0 = performance.now();
    let index = 0;

    for (let gridHeight = 0; gridHeight < height; gridHeight++) {
        const row = [];
        let heightIndex = gridHeight || 0;

        for (let gridWidth = 0; gridWidth < width; gridWidth++) {
            let square = newSquare(index, gridWidth, heightIndex, height);
            world.squaresObj[square.id] = square;
            row.push(square.id);
            index ++;
        }

        world.globalGrid.push(row);
    }
    let t1 = performance.now();
}

/////////////////////////////////////////////////// Elevation and Temp

function getElevation(currentElevation, power) {
    let plusMinus = [-1, 1];
    let multiplier = sample(plusMinus);

    multiplier = currentElevation > 90 ? -1 : multiplier;
    multiplier = currentElevation < -20 ? 1 : multiplier;
    const diff = random(power) * multiplier;

    let finalElevation = currentElevation + diff;

    if (finalElevation > 100) {
        finalElevation = 100;
    }

    return finalElevation;
}

function assignElevationFromSquare(current, variance) {
    const shuffledDirectionArray = shuffle(current.mainSidesArray);

    for (let index = 0; index < shuffledDirectionArray.length; index++) {
        let side = world.squaresObj[shuffledDirectionArray[index]];
        if (!side.avgElevation) {
            side.avgElevation = getElevation(current.avgElevation, variance);
            current = side;
            assignElevationFromSquare(current, variance);
        }
    }
}

function fillMissedElevation(square) {
    shuffle(directionArray).forEach(side => {
        if (square[side] && world.squaresObj[square[side]].avgElevation) {
            square.avgElevation = world.squaresObj[square[side]].avgElevation;
            return;
        }
    });
}

function assignTempStatsToSquare(square) {
    let seasonIndex = world.currentSeason.index;
    // let heightIndex = square.heightIndex > 0 ? square.heightIndex : 1;

    square.totalTempArray[seasonIndex] += square.baseTemp;
    square.avgTempArray[seasonIndex] = round(square.totalTempArray[seasonIndex] / totalYears || 0, 2);

    square.avgTemp = round(mean(square.avgTempArray), 2);
    square.avgHighTemp = Math.max(...square.avgTempArray);
    square.avgMinTemp = Math.min(...square.avgTempArray);
    square.avgTempDiff = square.avgHighTemp - square.avgMinTemp;
}

function assignTempToSquare(square) {
    /*
    Start with north% and north adjust. North adjust is subtracted from base temp, but the various seasons add
    portions of north adjust back. In winter, full north adjust is in effect. In summer, most of the adjust is removed.

    Elevation remains constant adjust and only varies by north adjust with season.
    */

    let latitudeAdjust = 1 - square.latitude;
    let precipAdjust = (square.precipitation * .5) || 0;
    let adjustedTemp = Math.round(baseTemp - ((seasonTemp * latitudeAdjust) - precipAdjust));

    let elevation = square.avgElevation > 0 ? square.avgElevation : 1;
    let elevationAdjust = elevation;

    square.baseTemp = Math.round(adjustedTemp - elevationAdjust);
    square.baseTemp = clamp(square.baseTemp, 0, 120);

    assignTempStatsToSquare(square)
}

function assignTempAndFillMissedElevationToSquare(square) {
    if(!square.avgElevation) {
        fillMissedElevation(square);
    }

    assignTempToSquare(square);
}

//fill in any missed elevation and assign temp
function assignTempToGrid() {
    loopGrid(assignTempAndFillMissedElevationToSquare)
}

function roundWaterCorners(square) {
    if (square.w && square.w.avgElevation <= world.waterLevel) {
        if (square.n && square.n.avgElevation <= world.waterLevel) {
            square.cornerStyles.borderTopLeftRadius = `${cornerRadius}%`;
        }

        if (square.s && square.s.avgElevation <= world.waterLevel) {
            square.cornerStyles.borderBottomLeftRadius = `${cornerRadius}%`;
        }
    }

    if (square.e && square.e.avgElevation <= world.waterLevel) {
        if (square.n && square.n.avgElevation <= world.waterLevel) {
            square.cornerStyles.borderTopRightRadius = `${cornerRadius}%`;
        }

        if (square.s && square.s.avgElevation <= world.waterLevel) {
            square.cornerStyles.borderBottomRightRadius = `${cornerRadius}%`;
        }
    }
}

//////////////////////////////////// Colors
function assignGridColorToSquare(square) {
    square.gridColor = getGridPlantColor(square, world.waterLevel, world.currentSeason.name);
    square.gridColorStyle = `rgb(${square.gridColor.r}, ${square.gridColor.g}, ${square.gridColor.b})`;

    square.groundColor = getGridColor(square, world.waterLevel, world.currentSeason.name);
    square.groundColorStyle = `rgb(${square.groundColor.r}, ${square.groundColor.g}, ${square.groundColor.b})`;

    let r = 100 - square.avgElevation;
    let g = r;
    let b = r;
    square.elevationStyle = `rgb(${r}, ${g}, ${b})`;

    if (square.avgElevation < world.waterLevel) {
        square.rainfallStyle = "white";
    } else if(square.avgPrecip < 3) {
        square.rainfallStyle = "yellow";
    } else if (square.maxDroughtLength > 0) {
        square.rainfallStyle = "orange";
    } else if (square.maxDroughtLength > 2) {
        square.rainfallStyle = "red";
    } else {
        b = 255 - square.precipitation;
        r = b - 30;
        g = b - 30;
        square.rainfallStyle = `rgb(${r}, ${g}, ${b})`;
    }

    r = square.baseTemp + 100;
    g = r - 70;
    b = 255 - square.baseTemp;
    square.temperatureStyle = `rgb(${r}, ${g}, ${b})`;

    // if(square.avgElevation > world.waterLevel) {
    //     roundWaterCorners(square);
    // }
}

function assignGridColorsToGrid() {
    loopGrid(assignGridColorToSquare)
}


/////////////////////////////////// Sides

export function assignSidesToSquare(square) {
    const {widthIndex, heightIndex} = square
    const row = world.globalGrid[heightIndex];

    if (widthIndex > 0) {
        let wSquare = world.squaresObj[row[widthIndex - 1]]
        square.w = wSquare.id;
        square.allSidesArray.push(wSquare.id);
        square.mainSidesArray.push(wSquare.id);

        wSquare.e = square.id;
        wSquare.allSidesArray.push(square.id);
        wSquare.mainSidesArray.push(square.id);

        if (heightIndex > 0) {
            let nwSquare = world.squaresObj[world.globalGrid[heightIndex - 1][widthIndex - 1]];
            square.nw = nwSquare.id;
            square.allSidesArray.push(nwSquare.id);

            nwSquare.se = square.id;
            nwSquare.allSidesArray.push(square.id);
        }
    }

    if (heightIndex > 0) {
        let nSquare = world.squaresObj[world.globalGrid[heightIndex - 1][widthIndex]]
        square.n = nSquare.id;
        square.allSidesArray.push(nSquare.id);
        square.mainSidesArray.push(nSquare.id);

        nSquare.s = square.id;
        nSquare.allSidesArray.push(square.id);
        nSquare.mainSidesArray.push(square.id);

        if (widthIndex < heightIndex - 1) {
            let neSquare = world.squaresObj[world.globalGrid[heightIndex - 1][widthIndex + 1]];
            square.ne = neSquare.id;
            square.allSidesArray.push(neSquare.id);

            neSquare.sw = square.id;
            neSquare.allSidesArray.push(square.id);
        }
    }
}

export function assignSidesToGrid() {
    loopGrid(assignSidesToSquare);
}

////////////////////////////////// Slope

function findLowestSide(square) {
    let lowSideHeight = square.avgElevation + square.waterElevation;
    let lowSide = null;
    let levelSides = [];

    for (let i = 0; i < squareSideArray.length; i++) {
        const side = square[squareSideArray[i]];

        if (side && side.avgElevation + side.waterElevation < lowSideHeight) {
            lowSideHeight = side.avgElevation + side.waterElevation;
            lowSide = side;
        } else if (side && side.avgElevation + side.waterElevation === square.avgElevation + square.waterElevation) {
            levelSides.push(side);
        }
    }

    square.lowSide = lowSide;

    return square;
}


//////////////////////////////////// Precipitation
function findDroughts(square) {
    let droughts = 0;
    let maxDroughtLength = 0;
    let droughtStretch = 0;

    square.avgPrecipArray.forEach(precip => {
        if(precip === 0) {
            droughts ++;
            droughtStretch ++;
            if (droughtStretch > maxDroughtLength) {
                maxDroughtLength = droughtStretch;
            } else {
                droughtStretch = 0;
            }
        }
    })

    square.droughts = droughts;
    square.maxDroughtLength = maxDroughtLength;
}

function applyPrecipStatsToSquare(square) {
    let seasonIndex = world.currentSeason.index;

    square.totalPrecipArray[seasonIndex] += square.precipitation;
    const precipAvg = round(square.totalPrecipArray[seasonIndex] / totalYears, 2);
    if (Number.isNaN(precipAvg)) {
        console.log('NAN precipAvg **', square.totalPrecipArray[seasonIndex], totalYears, square.totalPrecipArray[seasonIndex] / totalYears);
    }
    square.avgPrecipArray[seasonIndex] = precipAvg === Infinity ? 0 : precipAvg;
    square.avgPrecip = round(mean(square.avgPrecipArray), 2);

    findDroughts(square);
}

function applyRain(square) {
    const elevationBonus = Math.floor(square.avgElevation / 4);
    const maxChance = 95 + elevationBonus;
    const rainChance = random(1, maxChance);
    const rainAmount = random(1, 3) * rainMultiplier;
    rainLeft = rainLeft * rainMultiplier;

    if (rainLeft > 0 && square.avgElevation > world.waterLevel && rainChance > 85) {
        square.precipitation += rainAmount;
        totalRainApplied += rainAmount;
        rainLeft -= rainAmount;
        applyPrecipStatsToSquare(square);

    } else if (square.avgElevation <= world.waterLevel) {
        rainLeft += random(.05, .1);
    }
}

function distributeRain(square) {
    let elevationBonus = matchRangeToRange([0, 1], [0, 99], square.avgElevation, 2);
    const rainAmount = round((random(1, 2) * rainMultiplier) * elevationBonus, 2);
    rainLeft = rainLeft * rainMultiplier;

    if (rainLeft > 0 && square.avgElevation > world.waterLevel) {
        square.precipitation += rainAmount;
        totalRainApplied += rainAmount;
        rainLeft -= rainAmount;
        applyPrecipStatsToSquare(square);

    } else if (square.avgElevation <= world.waterLevel) {
        rainLeft += random(.2, .5) * rainMultiplier;
    }
}



function applyEvaporation(square) {
    if (square.avgElevation > world.waterLevel && square.precipitation) {
        square.precipitation -= EVAPORATION_RATE;
        square.precipitation = clamp(square.precipitation, 0, 150);
    }
}

export function applyRainAndEvaporation(square) {
    applyRain(square);
    applyEvaporation(square);
}



export function applySeasonsRain(evaporate, color) {

    let rainType = applyRainAndEvaporation;
    if(!evaporate) {
        rainType = distributeRain;
    }

    scanGridByDirection(world.currentSeason.windDirection, rainType, () => {
        rainLeft = world.currentSeason.rainAmount
    });

    advanceSeason(color);

    return getReturnState();
}

export function applyYearsRain(multiplier = 1, evaporate, color = true) {
        rainMultiplier = multiplier
        for (let j = 0; j < 4; j++) {
            applySeasonsRain(evaporate, color);
        }

    return getReturnState();
}

export function applyInitialRain(times, evaporate) {
    let amountPerCycle = Math.round(20 / times, 0);
    for (let index = 0; index < times; index++) {
        applyYearsRain(amountPerCycle, evaporate, index === times - 1);
    }
}

//////////////////////////////////// Global Moisture
export function increaseMoisture(amount = 1) {
    world.waterLevel += amount;
    console.log('increaseMoisture -- assignGridColorsToGrid');

    assignGridColorsToGrid();

    return getReturnState();
}

export function decreaseMoisture(amount = 1) {
    world.waterLevel -= amount;
    console.log('decreaseMoisture -- assignGridColorsToGrid');
    assignGridColorsToGrid();

    return getReturnState();
}

//////////////////////////////////// Biosphere

/*
Plant dispersal types:
1) spread to adjacent - moves outward by a radius
2) random dispersal - spreads outward to x random squares within a range
*/

function spreadPlantToAdjacent(plant, start, distance) {
    spreadFromSquare(start, distance, (square) =>{
        testPlantAgainstSquare(square, plant);
    });
}

function disperseFromPoint(start, maxDistance, times, callBack) {
    const {heightIndex, widthIndex} = start;

    for (let count = 0; count < times; count++) {
        const randWidth = random(widthIndex - maxDistance, widthIndex + maxDistance);
        const randHeight = random(heightIndex - maxDistance, heightIndex + maxDistance);
        const squareId = world.globalGrid[randHeight] && world.globalGrid[randHeight][randWidth];

        if (squareId) {
            const square = world.squaresObj[squareId];

            if (square) {
                callBack(square);
            }
        }
    }
}

function dispersePlant(plant, start, numSeeds, maxDistance) {
    const {heightIndex, widthIndex} = start;

    colorYellow(start);
    for (let seed = 0; seed < numSeeds; seed++) {
        const randWidth = random(widthIndex - maxDistance, widthIndex + maxDistance);
        const randHeight = random(heightIndex - maxDistance, heightIndex + maxDistance);
        const squareId = world.plantArray[randHeight] && world.plantArray[randHeight][randWidth];

        if (squareId) {
            const square = world.squaresObj[squareId];
            if(square && square.avgElevation > world.waterLevel) {
                colorRed(square);
                testPlantAgainstSquare(square, plant);
            }
        }
    }
}

function testMutationAgainstSquares(plant, squares) {
    for (let index = 0; index < squares.length; index++) {
        // plantCompetitionRuns ++;
        let square = world.squaresObj[squares[index]];
        // console.log('testing plant', plant.id, 'in square', square.id, 'against ownSquare', square.id);

        testPlantAgainstSquare(square, plant);
        disperseFromPoint(square, 10, 10, (testSquare) => {
            testPlantAgainstSquare(testSquare, plant);
        })

        // spreadPlantToAdjacent(plant, square, 10)

        // for (let index = 0; index < square.allSidesArray.length; index++) {
        //     const side = world.squaresObj[square.allSidesArray[index]];
        //     // console.log('testing plant', plant.id, 'in square', square.id, 'against square', side.id);
        //     testPlantAgainstSquare(side, plant);
        // }
    }
}

function mutateArray(array, power) {
    if (random(1, 5) === 5) {
        array.push(random(1, power))
    } else if (array.length > 1 && random(1, 5) === 5) {
        array.shift();
    }

    for (let index = 0; index < array.length; index++) {
        array[index] += clamp(random(power * -1, power), 1, 50);
    }
}

function newPlantMutation(basePlant, power) {
    // let plant = totalEvolutions === 1 ? cloneDeep(testPlant2) : cloneDeep(testPlant3);
    let plant = cloneDeep(basePlant);
    plant.id = shortid.generate();
    plant.squares = [];
    plant.ancestor = basePlant.id;
    let {
        foliageProfile,
        rootProfile
    } = plant;
    mutateArray(foliageProfile, power);
    mutateArray(rootProfile, power);

    plant.foliageMass = sum(foliageProfile);
    plant.rootMass = sum(rootProfile);
    plant.totalMass = plant.foliageMass + plant.rootMass;

    applySurvivalStatsToPlant(plant);
    // console.log('testing new mutation against squares', basePlant.squares);

    if (plant.minPrecip < lowestMinPrecipMutaion.minPrecip) {
        lowestMinPrecipMutaion = plant;
    }

    testMutationAgainstSquares(plant, basePlant.squares);
    if(plant.squares.length > 0) {
        if (plant.minPrecip < lowestSurvivingMinPrecip.minPrecip) {
            lowestSurvivingMinPrecip = plant;
        }
        successfulMutations ++;
        return plant;
    }

    return null;
}

export function getMutationsForPlant(plant, number = 1, power = 5) {
    // console.log('getMutationsForPlant', plant.id);

    let newPlantIds = [];
    for (let count = 0; count < number; count++) {
        let newPlant = newPlantMutation(plant, power);
        if(newPlant) {
            newPlantIds.push(newPlant.id);
            world.plantArray.push(newPlant.id);
            world.plantObj[newPlant.id] = newPlant;
        }
    }

    return newPlantIds;
}

export function evolvePlants(number, power) {
    console.log('Evolving plants', world.plantArray);
    console.log('plants', world.plantObj);

    for (let index = 0; index < world.plantArray.length; index++) {
        let plantId = world.plantArray[index];
        let plant = world.plantObj[plantId];
        plant.mutations = getMutationsForPlant(plant, number, power);
    }
    assignGridColorsToGrid();
    console.log('successfulMutations', successfulMutations);
}

export function evolveOrganisms(times) {
    totalEvolutions++;
    let t1 = performance.now()
    evolvePlants(times, 10);
    console.log('lowest mutation', lowestMinPrecipMutaion);
    console.log('lowest surviving', lowestSurvivingMinPrecip);
    console.log('evolveOrganisms time:', performance.now() - t1);
    return getReturnState();
}

function extinctPlant(plant) {
    world.plantObj[plant.id].extinct = true;
    remove(world.plantArray, (targetId) => {
        return targetId === plant.id
    });
}

function cullPlants() {
    for (const key in world.plantObj) {
        let plant = world.plantObj[key];
        if (plant.squares.length <= 0) {
            extinctPlant(plant);
        }
    }
}

function competePlantAgainstSquare(square, plant) {
    plantCompetitionRuns++;
    if(Array.isArray(square.plants) && square.plants.indexOf(plant.id) === -1) {
        plant.squares.push(square.id);
        const position = sortedIndexBy(square.plants, plant.id, (plantId) => world.plantObj[plantId] && world.plantObj[plantId].solarRatio);
        square.plants.splice(position, 0, plant.id);

        if (!world.plantObj[plant.id]) {
            world.plantObj[plant.id] = plant;
        }

        world.plantObj[plant.id].extinct = false;
        if(square.plants.length > 10) {
            const removedPlant = world.plantObj[square.plants.shift()];
            remove(removedPlant.squares, (targetId) => targetId === square.id);
            if(removedPlant.squares.length <= 0) {
                extinctPlant(removedPlant);
            }
            removedPlants++;
        }
    }
}

function testPlantAgainstSquare(square, plant) {
    square.plantTested ++;
    /*
    Plant survival logic:
    If square precip and temp stats are outside range- do not add
    If square conditions are in range add and calculate survival score

    Factors:
    Plants are not limited by maxTemp or maxPrecip. They have a minTemp and minPrecip
    Because minTemp and minPrecip both limit solarGain and solarEfficiency, plants with
    lower minTemp or minPrecip will be out-competed in more ideal environments

    minTemp(-10 - 70): determined by foliageStrength

    minPrecip(1 - 70): determined by root-spread

    maxDroughtLength(0 - 3): determined by rootDepth and rootRatio
    */
    const {avgMinTemp, avgPrecip, maxDroughtLength} = square;
    const {minTemp, minPrecip, droughtTolerance} = plant;

    if (maxDroughtLength > droughtTolerance) {
        square.plantRejectedForDrought++;
        if (square.plantRejectedForDroughtArray.length === 0) {
            square.plantRejectedForTempArray.push(maxDroughtLength)
        }
        square.plantRejectedForDroughtArray.push(droughtTolerance);
        // if (plant.id === 1000) {
        //     console.log('^^^ rejecting TEST_PLANT on drought maxDroughtLength > droughtTolerance', maxDroughtLength, droughtTolerance);
        // }
        rejectedOnDrought++;
        // console.log('Rejecting plant on drought (plant / square)', droughtTolerance, maxDroughtLength);
        return;
    }

    if (avgPrecip < minPrecip) {
        square.plantRejectedForPrecip++;
        if (square.plantRejectedForPrecipArray.length === 0) {
            square.plantRejectedForTempArray.push(avgPrecip)
        }
        square.plantRejectedForPrecipArray.push(minPrecip);
        // if (plant.id === 1000) {
        //     console.log('^^^ rejecting TEST_PLANT on precip avgPrecip < minPrecip', avgPrecip, minPrecip);
        // }
        rejectedOnPrecip++;
        // console.log('Rejecting plant on precip (plant / square)', minPrecip, avgMinPrecip);
        return;
    }

    if (avgMinTemp < minTemp) {
        square.plantRejectedForTemp ++;
        if (square.plantRejectedForTempArray.length === 0) {
            square.plantRejectedForTempArray.push(avgMinTemp)
        }
        square.plantRejectedForTempArray.push(minTemp);
        // if(plant.id === 1000) {
        //     console.log('^^^ rejecting TEST_PLANT on temp avgMinTemp < minTemp', avgMinTemp, minTemp);
        // }
        // console.log('Rejecting plant on temp (plant / square)', minTemp, avgMinTemp);
        rejectedOnTemp ++;
        return;
    }

    competePlantAgainstSquare(square, plant);
}

function assignPlantsToSquare(square) {
    if (square.avgElevation <= world.waterLevel) {
        return;
    }

    for (let index = 0; index < world.plantArray.length; index++) {
        const plant = world.plantObj[world.plantArray[index]];
        testPlantAgainstSquare(square, plant);
    }
}

function assignOrganismsToSquare(square) {
    assignPlantsToSquare(square);
    assignGridColorToSquare(square);
}

export function assignOrganismsToGrid() {
    loopGrid(assignOrganismsToSquare);
    console.log('lowest mutation', lowestMinPrecipMutaion);
    console.log('lowest surviving', lowestSurvivingMinPrecip);


    return getReturnState();
}


//////////////////////////////////// Initialize

function assignTempAndColor() {
    loopGrid(
        (square) => {
            assignTempAndFillMissedElevationToSquare(square);
            assignGridColorToSquare(square);
        }
    );
}

function assignTemp() {
    loopGrid(
        (square) => {
            assignTempAndFillMissedElevationToSquare(square);
        }
    );
}


/////////////////////////////////// World Params
export function setSeasons(moisture, temp) {
    const winterColor = "rgb(165, 220, 255)";
    const springColor = "rgb(165, 255, 135)";
    const summerColor = "rgb(250, 244, 87)";
    const fallColor = "rgb(255, 204, 87)";

    const winterSeason = {
        name: "Winter",
        avgTemp: 1,
        windDirection: sample(directionArray),
        rainAmount: random(10, 20) + moisture,
        backgroundColor: winterColor,
        index: 0
    }

    const springSeason = {
        name: "Spring",
        avgTemp: .6,
        windDirection: sample(directionArray),
        rainAmount: random(0, 10) + moisture,
        backgroundColor: springColor,
        index: 1
    }

    const summerSeason = {
        name: "Summer",
        avgTemp: .2,
        windDirection: sample(directionArray),
        rainAmount: random(0, 5) + moisture,
        backgroundColor: summerColor,
        index: 2
    }

    const fallSeason = {
        name: "Fall",
        avgTemp: .7,
        windDirection: sample(directionArray),
        rainAmount: random(5, 15) + moisture,
        backgroundColor: fallColor,
        index: 3
    }

    return [winterSeason, springSeason, summerSeason, fallSeason];
}

export function advanceSeason(color = false) {

    let currentIndex = world.currentSeason.index;
    if(currentIndex === 3) {
        world.currentSeason = world.seasons[0];
    } else {
        world.currentSeason = world.seasons[currentIndex + 1];
    }

    const tempModifier = world.currentSeason.avgTemp + random(-0.2, 0.2);

    seasonTemp = Math.ceil(baseTemp * tempModifier);

    totalSeasons++;
    if (totalSeasons % 4 === 0) {
        totalYears++;
    }

    if(color) {
        assignTempAndColor();
    } else {
        assignTemp();
    }

    return getReturnState();
}

export function initNewWorldParams(zoomLevel, waterLevel) {
    world.globalMoisture = random(15, 40);  // determines the number of times yearly rain will be applied to the map
    // world.globalTemp = random(.25, 3);
    world.globalTemp = 1;
    world.seasons = setSeasons(world.globalMoisture, world.globalTemp);
    world.currentSeason = world.seasons[2];
    world.zoomLevel = zoomLevel;
    world.waterLevel = waterLevel;

    const tempModifier = world.currentSeason.avgTemp + random(-0.2, 0.2);
    seasonTemp = Math.ceil(baseTemp * tempModifier);
}


function getReturnState() {
    return {
        selectedSquare: null,
        world: {
            ...world,
            seasons: setSeasons(),
            avgTemp: seasonTemp,
        },
        totalSeasons,
        worldColorsGrid,
        grid: {
            gridArray: world.globalGrid,
            zoomArray: world.globalZoomArray,
            height: mapHeight,
            width: mapWidth,
            mapZoomHeight,
            mapZoomWidth,
            isZoomed
        }
    }
}

function colorRed(square) {
    square.elevationStyle = "red";
}

function colorYellow(square) {
    square.elevationStyle = "yellow";
}

// Handles initial setup of a new world. Can be passed an optional pre-defined mock grid or world-params for testing
export function initNewWorld(worldOptions) {
    console.log('World', world);
    let plants = loadPlantArray(3);
    world.plantObj = plants.plantObj;
    world.plantArray = plants.plantArray;

    let t1 = performance.now();
    const{height, width, zoomLevel, waterLevel, grid, woldParams} = worldOptions;

    mapHeight = height;
    mapWidth = width;
    let a1;
    initNewWorldParams(zoomLevel, waterLevel);  //Set random world parameters

    if(!grid) {
        a1 = performance.now();
        setRandomGlobalGrid(height, width);
        console.log('setRandomGlobalGrid time', performance.now() - a1);
    } else {
        world.globalGrid = grid;
    }

    a1 = performance.now();
    assignSidesToGrid();
    console.log('assignSidesToGrid time', performance.now() - a1);

    // assignFromLeft();

    let randomSquareId = getRandomFromGrid();
    let randomSquare = world.squaresObj[randomSquareId];

    a1 = performance.now();
    assignElevationFromSquare(randomSquare, 2);
    console.log('assignElevationFromSquare time', performance.now() - a1);

    a1 = performance.now();
    applyInitialRain(2, false);
    console.log('applyInitialRain time', performance.now() - a1);
    console.log('totalRainApplied', totalRainApplied);


    a1 = performance.now();
    assignOrganismsToGrid();
    console.log('assignOrganismsToGrid time', performance.now() - a1);
    let c1 = performance.now();
    cullPlants();
    console.log('cullPlants time', performance.now() - c1);
    colorYellow(randomSquare);
    disperseFromPoint(randomSquare, 10, 10, colorRed)
    // a1 = performance.now();
    // evolvePlants(1, 5);
    // console.log('evolvePlants time', performance.now() - a1);

    console.log('rejectedOnTemp', rejectedOnTemp);
    console.log('rejectedOnPrecip', rejectedOnPrecip);
    console.log('rejectedOnDrought', rejectedOnDrought);

    console.log('removedPlants', removedPlants);

    console.log('--------------------------------------------------');

    console.log('Plant Array', world.plantArray);
    console.log('Plant Object', world.plantObj);
    console.log('plantCompetitionRuns', plantCompetitionRuns);


    let t2 = performance.now();

    console.log('Init time', t2 - t1);

    return getReturnState();
}


/////////////////////////////////////////////// Terraform

export function moveTime(params) {
    let {years, moisture} = params;
    let yearsIncrease = Number(years);
    let waterIncrease = Number(moisture) * yearsIncrease;
    increaseMoisture(waterIncrease);

    return getReturnState();
}

function newZoomSquare(square) {
    return square;
}


export function toggleZoom(square, zoomHeight = 9, zoomWidth = 15) {

    isZoomed = !isZoomed;
    if (!isZoomed) {
        world.globalZoomArray = [];
        return getReturnState();
    }

    mapZoomHeight = zoomHeight;
    mapZoomWidth = zoomWidth;


    let heightIndex = clamp(square.heightIndex - Math.floor(zoomHeight / 2), 0, mapHeight);
    let widthIndex = clamp(square.widthIndex - Math.floor(zoomWidth / 2), 0, mapWidth);
    let heightLength = heightIndex + zoomHeight;
    let widthLength = widthIndex + zoomWidth;

    for (heightIndex; heightIndex < heightLength; heightIndex++) {
        outerCount ++;
        let row = [];
        for (let index = widthIndex; index < widthLength; index++) {
            row.push(newZoomSquare(world.globalGrid[heightIndex][index]));
            innerCount ++;
        }

        world.globalZoomArray.push(row);
    }

    return getReturnState();
}

//////////////////////////////////////// build from adjacent
/*
possible approaches
1) build out from upper left. First square sets elevation with option ot overflow a short distance onto adjacent squares.
Adjacent squares set elevation without overwriting existing

2) treat entire grid of squares as single grid apply elevation "randomly" but with weight on local elevation.
Treat center point of square as elevation point.


//////////////////////////////////////// Build detailed grid from basic grid
Given a master grid with x squares each with an elevation, build a grid of y * x squares that slopes from one elevation point
to another with the boundaries set by the initial master grid.

Needed- function that takes four points as reference - nearest e,w,n,s - returns a semi-weighted random that reflects it's
relative proximity to each point.

//////////////////////////////////////// Single pass elevation grid
from top-left scan right assigning semi-random elevation
on next row-weight elevation based on square above.

*/
