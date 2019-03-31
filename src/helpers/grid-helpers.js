import {sum, sample, shuffle, clamp, mean, sortBy, sortedIndexBy, round, remove, cloneDeep} from "lodash";
import {
    getGridColor,
    getGridPlantColor,
    colorTracker,
    randomColor,
    morphColor,
    morphColorStyle
} from "./color-helpers";
import {worldColorsGrid} from "../config/colors-config";
import {random, matchRangeToRange, matchInverseRangeToRange} from "./utilities";
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
let rejectedOnNiche = 0;
let removedPlants = 0;
let plantsTested = 0;
let successfulMutations = 0;
let plantSpeciationThreshold = 3;
let speciesRejected = 0;

let plantDiffArray = [];

let totalBiomeSquares = 0;
let totalBiomes = 0;
let tempRange = 3;
let precipRange = 3;

let plantCompetitionRuns = 0;
let totalRainApplied = 0;



let exampleSquare = null;

let rainLeft;
let totalYears = 1;
let totalSeasons = 0;
let totalEvolutions = 0;
let tallestPlant = {height: 0};
let tallestSurvivingPlant = {height: 0};

let cornerRadius = 30;
let baseTemp = 100;
let seasonTemp = 100;
let mapHeight;
let mapWidth;
let mapZoomHeight;
let mapZoomWidth;
let isZoomed = false;


let initialPlantsAdded = false;

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

function disperseFromPoint(start, maxDistance, times, callBack) {
    const {
        heightIndex,
        widthIndex
    } = start;

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
        totalPlants: 0,
        plantNiches: [],

        plantsTested: 0,
        plantRejectedForTemp: 0,
        plantRejectedForPrecip: 0,
        plantRejectedForScore: 0,
        plantRejectedForDrought: 0,
        plantRejectedForNiche: 0,

        plantRejectedForTempArray: [],
        plantRejectedForPrecipArray: [],
        plantRejectedForScoreArray: [],
        plantRejectedForDroughtArray: [],
        plantRejectedForNicheArray: [],
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
            world.squaresArray.push(square.id);
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

    if (square.biome) {
        let biomeId = square.biome;
        let biome = world.biomes[biomeId];
        let {
            totalPlants
        } = biome;

        square.gridColor = getGridPlantColor(square, totalPlants, world.waterLevel, world.currentSeason.name);
        square.gridColorStyle = `rgb(${square.gridColor.r}, ${square.gridColor.g}, ${square.gridColor.b})`;
    }

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
    loopGrid(assignGridColorToSquare);
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



//////////////////////////////////////////////////////////////////////////////////////////////////// Biosphere
function createBiome(square) {
    const {id, avgMinTemp, avgPrecip} = square;
    let biomeColor = morphColorStyle(getGridColor(square, world.waterLevel, world.currentSeason.name), 30);
    let biomePlantColor = getGridColor(square, world.waterLevel, world.currentSeason.name);

    world.biomes[id] = {
        id: id,
        avgMinTemp: avgMinTemp,
        avgPrecip: avgPrecip,
        squares: [id],
        biomeColor: biomeColor,
        biomePlantColor: biomePlantColor,
        adjacentBiomes: {},
        plants: [],
        totalPlants: 0,
        plantNiches: [],

        plantsTested: 0,
        plantRejectedForTemp: 0,
        plantRejectedForPrecip: 0,
        plantRejectedForScore: 0,
        plantRejectedForDrought: 0,
        plantRejectedForNiche: 0,

        plantRejectedForTempArray: [],
        plantRejectedForPrecipArray: [],
        plantRejectedForScoreArray: [],
        plantRejectedForDroughtArray: [],
        plantRejectedForNicheArray: []
    }

    world.biomesArray.push(id);

    square.biome = id;
    square.biomeColor = biomeColor;

    totalBiomes++;

    return world.biomes[id];
}

function testBiomeAgainstSquare(square, biome) {
    let tempDiff = Math.abs(biome.avgMinTemp - square.avgMinTemp);
    let precipDiff = Math.abs(biome.avgPrecip - square.avgPrecip);

    if (tempDiff < tempRange && precipDiff < precipRange) {
        return true;
    }

    return false;
}

function addBiomeToSquare(square, biome) {
    const id = square.id;

    biome.squares.push(id);
    square.biome = biome.id;
    square.biomeColor = biome.biomeColor;
}

function connectBiomes(adjacentid, currentBiome) {
    const adjacentBiome = world.biomes[adjacentid];
    if (adjacentBiome === undefined) {
        console.log('adjacent is undefined', adjacentid);

    }
    if (!adjacentBiome.adjacentBiomes[currentBiome.id]) {
        adjacentBiome.adjacentBiomes[currentBiome.id] = currentBiome.id;
    }
    if (!currentBiome.adjacentBiomes[adjacentBiome.id]) {
        currentBiome.adjacentBiomes[adjacentBiome.id] = adjacentBiome.id;
    }
}

function assignBiomeToSquareLoop(testSquare) {
    // if(testSquare.avgElevation > world.waterLevel) {
    //     totalBiomeSquares ++;
    // }
    // else {
    //     testSquare.biomeColor = "blue";
    // }

    // if (testSquare.avgElevation < world.waterLevel || testSquare.biome) {
    //     return;
    // }

    if (testSquare.biome) {
        return;
    }
    // console.log('--------------------------------------------555555555555555555');

    // console.log('assigning biome to ', testSquare.id);


    const biome = createBiome(testSquare);

    let testArray = [testSquare];

    let index = 0;
    let safety = 0;

    while(safety < 1000 && testArray[index]) {
        // console.log('Looping', safety);

        safety ++;
        const square = testArray[index];

        square.mainSidesArray.forEach(sideId => {
            const side = world.squaresObj[sideId];
            // console.log('checking side', side.id);
            // console.log('hasBiome', side.biome);
            // console.log('fits biome', testBiomeAgainstSquare(side, biome));


            if(!side.biome && testBiomeAgainstSquare(side, biome)) {
                addBiomeToSquare(side, biome)
                testArray.push(side);
                // console.log('added to testArray', testArray);
            }
            if (side.biome && side.avgElevation > world.waterLevel) {
                connectBiomes(side.biome, biome);
            }
        });

        index++;
    }
}

export function assignBiomes() {
    const shuffleSquares = shuffle(world.squaresArray);
    for (let index = 0; index < shuffleSquares.length; index++) {
        const squareId = shuffleSquares[index];
        const square = world.squaresObj[squareId];
        assignBiomeToSquareLoop(square);
    }
}
/*
Plant dispersal types:
1) spread to adjacent - moves outward by a radius
2) random dispersal - spreads outward to x random squares within a range
*/




function testMutationAgainstBiomes(plant, plantBiomes) {
    plantBiomes.forEach(biomeId => {
        const biome = world.biomes[biomeId];
        // console.log('biome', biome);

        testPlantAgainstBiome(biome, plant);
        if(biome.adjacentBiomes) {
            for (const biomeId in biome.adjacentBiomes) {
                if (biome.adjacentBiomes.hasOwnProperty(biomeId)) {
                    const adjacentBiome = world.biomes[biome.adjacentBiomes[biomeId]];
                    testPlantAgainstBiome(adjacentBiome, plant);
                }
            }
        }
    });
}

function mutateArray(array, power, reverse = false) {
    if (random(1, 2) === 2) {
        array.push(random(2, power))
    } else if (array.length > 1 && random(1, 4) === 4) {
        array.shift();
    }

    for (let index = array.length - 1; index > 0; index--) {
        array[index] += clamp(random(power * -1, power), 1, 50);
    }
}

function testMutationDiff(plant, basePlant) {
    let heightDiff = Math.abs(plant.height - basePlant.height);
    let depthDiff = Math.abs(plant.depth - basePlant.depth);
    let solarRatioDiff = Math.abs(plant.solarRatio - basePlant.solarRatio) * 10;
    let tempDiff = Math.abs(plant.minTemp - basePlant.minTemp);
    let precipDiff = Math.abs(plant.minPrecip - basePlant.minPrecip);

    let totalDiff = heightDiff + depthDiff + solarRatioDiff + tempDiff + precipDiff;

    // console.log("Diffs ",heightDiff, depthDiff, solarRatioDiff, tempDiff, precipDiff);

    return totalDiff > plantSpeciationThreshold;
}

export function testPlantAgainstDiffArray(plant) {
    const {height, minPrecip, minTemp, id} = plant;
    const tempIndex = round(minTemp, -1);
    console.log('tempIndex', tempIndex);


    if(!plantDiffArray[height]) {
        plantDiffArray[height] = [];
        plantDiffArray[height][tempIndex] = [id];
        return true;
    } else if(!plantDiffArray[height][tempIndex]) {
        plantDiffArray[height][tempIndex] = [id];
        return true
    } else {
        plantDiffArray[height][tempIndex].forEach((gridPLantId) => {
            const gridPlant = world.plantObj[gridPLantId];

            if (!testMutationDiff(plant, gridPlant)) {
                return false;
            }
        })

        return true;
    }
}

function newPlantMutation(basePlant, power) {
    // let plant = totalEvolutions === 1 ? cloneDeep(testPlant2) : cloneDeep(testPlant3);
    let plant = cloneDeep(basePlant);
    plant.id = shortid.generate();
    plant.biomes = [];
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

    if (!testPlantAgainstDiffArray(plant)) {
        speciesRejected ++;
        return null;
    }

    if (plant.height > tallestPlant.height) {
        tallestPlant = plant;
    }

    testMutationAgainstBiomes(plant, basePlant.biomes);

    if(!plant.extinct) {
        if (plant.height > tallestSurvivingPlant.height) {
            tallestSurvivingPlant = plant;
        }
        successfulMutations ++;
        return plant;
    }

    return null;
}

export function getMutationsForPlant(plant, number = 1, power = 5) {
    let newPlantIds = [];

    for (let count = 0; count < 1; count++) {
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
    let length = world.plantArray.length;

    for (let index = 0; index < length; index++) {
        let plantId = world.plantArray[index];
        let plant = world.plantObj[plantId];
        plant.mutations = getMutationsForPlant(plant, number, power);
    }
    assignGridColorsToGrid();
}

export function evolveOrganisms(times, power) {
    totalEvolutions++;
    let t1 = performance.now();
    // let mutationsPerPlant = matchInverseRangeToRange([1, 2], [0, 1000], world.plantArray.length, 0);
    let mutationsPerPlant = 1;
    // console.log('mutations per plant = ', mutationsPerPlant);

    evolvePlants(times, power);
    // console.log('tallest mutation', tallestPlant.height, tallestPlant);
    // console.log('tallest surviving', tallestSurvivingPlant.height, tallestSurvivingPlant);
    console.log('evolveOrganisms time:', performance.now() - t1);
    console.log('speciesRejected', speciesRejected);
    console.log('plantCompetitionRuns', plantCompetitionRuns);
    console.log('***** Plant Array', world.plantArray.length);
    // console.log('Plant Object', world.plantObj);

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
        if (plant.biomes.length <= 0) {
            extinctPlant(plant);
        }
    }
}

function addToArray(id, array) {
    const position = sortedIndexBy(array, id, (plantId) => world.plantObj[plantId] && world.plantObj[plantId].solarRatio);
    array.splice(position, 0, id);
    return array;
}

function logArrayScores(array, message) {
    console.log('..............................', message);

    for (let index = 0; index < array.length; index++) {
        const plantId = array[index];
        console.log('Index', index, "score", world.plantObj[plantId] && world.plantObj[plantId].solarRatio);
    }
}

function competePlantAgainstBiome(biome, plant, niches, nicheIndex) {
    plantCompetitionRuns++;

    if (Array.isArray(niches) && plant.id && niches.indexOf(plant.id) === -1) {
        // console.log('Array is valid');

        if (!world.plantObj[plant.id]) {
            world.plantObj[plant.id] = plant;
        }
        // console.log('sorting to determine position - niches', niches);

        const position = sortedIndexBy(niches, plant.id, (plantId) => world.plantObj[plantId] && world.plantObj[plantId].solarRatio);
        // console.log('position', position);

        if(position === 0 && niches.length === 5) {
            return;
        }

        // console.log('adding to niches', niches);

        niches.splice(position, 0, plant.id);
        biome.totalPlants ++;
        plant.biomes.push(biome.id);
        // console.log('Added plant to niche');


        world.plantObj[plant.id].extinct = false;
        if(niches.length > 5) {
            // console.log('removing plant');

            biome.totalPlants --;
            const removedPlant = world.plantObj[niches.shift()];
            if (removedPlant.solarRatio > world.plantObj[niches[niches.length - 1]].solarRatio) {
                console.log('ERROR __________ removing higher score plant', world.plantObj[niches[niches.length - 1]].solarRatio, removedPlant);
                for (let index = 0; index < niches.length; index++) {
                    const plantId = niches[index];
                    const plant = world.plantObj[plantId];
                    console.log('score at', index, " =", plant.solarRatio);

                }
                console.log('removed-plant solar ratio', removedPlant.solarRatio);

            }

            remove(removedPlant.biomes, (targetId) => targetId === biome.id);
            if(removedPlant.biomes.length <= 0) {
                extinctPlant(removedPlant);
            }
            // console.log('finished removing plant');

            removedPlants++;
        }
    }
    // console.log('finished adding to niches');
    return;

}

function testPlantAgainstBiome(biome, plant) {
    plantsTested++;
    biome.plantsTested ++;
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
    const {plantNiches, avgMinTemp, avgPrecip} = biome;
    const {height, minTemp, minPrecip} = plant;
    const nicheIndex = matchRangeToRange([0,4], [0, 12], height, 0);
    const matchedNiche = biome.plantNiches[nicheIndex];

    if(!matchedNiche) {
        biome.plantRejectedForNiche ++;

        if (biome.plantRejectedForNicheArray.length === 0) {
            biome.plantRejectedForNicheArray.push(plantNiches.length)
        }
        biome.plantRejectedForNicheArray.push(height * 2);
        // if (plant.id === 1000) {
        //     console.log('^^^ rejecting TEST_PLANT on drought maxDroughtLength > droughtTolerance', maxDroughtLength, droughtTolerance);
        // }
        rejectedOnNiche++;
        // console.log('Rejecting plant on drought (plant / biome)', droughtTolerance, maxDroughtLength);
        return;
    }

    // if (maxDroughtLength > droughtTolerance) {
    //     biome.plantRejectedForDrought++;
    //     if (biome.plantRejectedForDroughtArray.length === 0) {
    //         biome.plantRejectedForDroughtArray.push(maxDroughtLength)
    //     }
    //     biome.plantRejectedForDroughtArray.push(droughtTolerance);
    //     // if (plant.id === 1000) {
    //     //     console.log('^^^ rejecting TEST_PLANT on drought maxDroughtLength > droughtTolerance', maxDroughtLength, droughtTolerance);
    //     // }
    //     rejectedOnDrought++;
    //     // console.log('Rejecting plant on drought (plant / biome)', droughtTolerance, maxDroughtLength);
    //     return;
    // }

    if (avgPrecip < minPrecip) {
        biome.plantRejectedForPrecip++;
        if (biome.plantRejectedForPrecipArray.length === 0) {
            biome.plantRejectedForPrecipArray.push(avgPrecip)
        }
        biome.plantRejectedForPrecipArray.push(minPrecip);
        // if (plant.id === 1000) {
        //     console.log('^^^ rejecting TEST_PLANT on precip avgPrecip < minPrecip', avgPrecip, minPrecip);
        // }
        rejectedOnPrecip++;
        // console.log('Rejecting plant on precip (plant / biome)', minPrecip, avgMinPrecip);
        return;
    }

    if (avgMinTemp < minTemp) {
        biome.plantRejectedForTemp ++;
        if (biome.plantRejectedForTempArray.length === 0) {
            biome.plantRejectedForTempArray.push(avgMinTemp)
        }
        biome.plantRejectedForTempArray.push(minTemp);
        // if(plant.id === 1000) {
        //     console.log('^^^ rejecting TEST_PLANT on temp avgMinTemp < minTemp', avgMinTemp, minTemp);
        // }
        // console.log('Rejecting plant on temp (plant / biome)', minTemp, avgMinTemp);
        rejectedOnTemp ++;
        return;
    }
    // console.log('competePlantAgainstBiome', biome, plant, matchedNiche, height - 1);

    competePlantAgainstBiome(biome, plant, matchedNiche, height - 1);
}

function assignPlantsToBiome(biome) {
    for (let index = 0; index < world.plantArray.length; index++) {
        const plant = world.plantObj[world.plantArray[index]];

        testPlantAgainstBiome(biome, plant);
    }
}

function assignPlantNichesToBiome(biome) {
    // tempScore = -2 - 10
    // precipScore = 0 - 20
    // nicheScore = 0 - 30

    // niches = 0 - 5
    let nicheScore = clamp(round((biome.avgMinTemp / 10) + biome.avgPrecip, 2), 0, 30);
    let niches = matchRangeToRange([0, 5], [0, 30], nicheScore, 0) || 0;

    for (let count = 0; count < niches; count++) {
        biome.plantNiches.push([]);
    }
}

function assignOrganismsToBiome(biome) {
    assignPlantNichesToBiome(biome);
    assignPlantsToBiome(biome);
}

export function assignOrganismsToGrid() {
    for (const key in world.biomes) {
        if (world.biomes.hasOwnProperty(key)) {
            const biome = world.biomes[key];
            // console.log('Assigning to biome', biome.id);

            assignOrganismsToBiome(biome);
        }
    }

    loopGrid(assignGridColorToSquare);

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
        selectedSquare: world.selectedSquare,
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
    let plants = loadPlantArray(1);
    world.plantObj = plants.plantObj;
    world.plantArray = plants.plantArray;
    world.biomes = {};
    world.biomesArray = [];

    let t1 = performance.now();
    const{height, width, zoomLevel, waterLevel, grid, woldParams} = worldOptions;

    mapHeight = height;
    mapWidth = width;
    let a1;
    initNewWorldParams(zoomLevel, waterLevel);  //Set random world parameters

    world.squaresArray = [];

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
    // testCompete()
    a1 = performance.now();
    assignBiomes(10, 10);
    console.log('assignBiomes time', performance.now() - a1);
    console.log('Total Biomes', totalBiomes);
    console.log('Percent of total biome squares', round(totalBiomes / totalBiomeSquares, 2));
    console.log('Biomes ((', world.biomes);




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
    console.log('rejectedOnNiche', rejectedOnNiche);
    let rejected = rejectedOnTemp + rejectedOnPrecip + rejectedOnDrought + rejectedOnNiche
    console.log('rejected', rejected);

    console.log('successful plants', plantsTested - rejected);
    console.log('exampleSquare', exampleSquare);


    console.log('removedPlants', removedPlants);
    console.log('--------------------------------------------------');

    console.log('Plant Array', world.plantArray);
    console.log('Plant Object', world.plantObj);
    console.log('plantCompetitionRuns', plantCompetitionRuns);
    initialPlantsAdded = true;


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
