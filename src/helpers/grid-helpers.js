import {sum, sample, shuffle, clamp, mean, sortBy, sortedIndexBy, round, remove, cloneDeep} from "lodash";
import {getGridColor, colorTracker, randomColor} from "./color-helpers";
import {worldColorsGrid} from "../config/colors-config";
import {random} from "./utilities";
import shortid from "shortid";
import gridMocks from "../../mocks/grid-mocks";
import {loadPlantArray, applySurvivalStatsToPlant} from "./animal-helpers/base-animals";
import { debug } from "util";

const directionArray = ["e", "s", "w", "n"];
const squareSideArray = ["e", "s", "w", "n", "ne", "nw", "se", "sw"];
const world = {};
const startingTemp = 100;
const EVAPORATION_RATE = .2;

let rejectedOnTemp = 0;
let rejectedOnPrecip = 0;
let rejectedOnDrought = 0;
let removedPlants = 0;


let globalGrid = [];
let globalZoomArray = [];
let plants = loadPlantArray(1);
let plantObj = plants.plantObj;
let plantArray = plants.plantArray;

let plantCompetitionRuns = 0;


let rainLeft;
let totalYears = 1;
let totalSeasons = 0;

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
    let heightIndex = random(0, globalGrid.length - 1);
    let widthIndex = random(0, globalGrid[0].length - 1);

    return globalGrid[heightIndex][widthIndex]
}

function loopGrid(callBack, outerCallBack) {
    if (!typeof callback === "function") {
        console.warn("callback must be a function --- in loopGrid()");
    }

    let gridHeight = globalGrid.length;
    let gridWidth = globalGrid[0].length;

    for (let heightIndex = 0; heightIndex < gridHeight; heightIndex++) {
        outerCallBack && outerCallBack(globalGrid[heightIndex]);
        for (let widthIndex = 0; widthIndex < gridWidth; widthIndex++) {
            const square = globalGrid[heightIndex][widthIndex];
            callBack(square);
        }
    }
}

function scanWest(callBack, outerCallBack) {
    let gridHeight = globalGrid.length;
    let gridWidth = globalGrid[0].length;

    for (let heightIndex = 0; heightIndex < gridHeight; heightIndex++) {
        outerCallBack && outerCallBack(globalGrid[heightIndex]);
        for (let widthIndex = gridWidth - 1; widthIndex >= 0; widthIndex--) {
            const square = globalGrid[heightIndex][widthIndex];

            callBack(square);
        }
    }
}

function scanSouth(callBack, outerCallBack) {
    let gridHeight = globalGrid.length;
    let gridWidth = globalGrid[0].length;

    for (let widthIndex = 0; widthIndex < gridWidth; widthIndex++) {
        outerCallBack && outerCallBack(globalGrid[widthIndex]);
        for (let heightIndex = 0; heightIndex < gridHeight; heightIndex++) {
            const square = globalGrid[heightIndex][widthIndex];

            callBack(square);
        }
    }
}

function scanNorth(callBack, outerCallBack) {
    let gridHeight = globalGrid.length;
    let gridWidth = globalGrid[0].length;

    for (let widthIndex = 0; widthIndex < gridWidth; widthIndex++) {
        outerCallBack && outerCallBack(globalGrid[widthIndex]);
        for (let heightIndex = gridHeight - 1; heightIndex >= 0; heightIndex--) {
            const square = globalGrid[heightIndex][widthIndex];

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


///////////////////////////// Grid creation

export function newSquare(index, widthIndex, heightIndex, gridHeight, options={}) { // options param is used to generate set-value squares for mocks
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

        index,
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

        plants: []
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
            row.push(newSquare(index, gridWidth, heightIndex, height));
            index ++;
        }

        globalGrid.push(row);
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
        let side = shuffledDirectionArray[index];
        if (!side.avgElevation) {
            side.avgElevation = getElevation(current.avgElevation, variance);
            current = side;
            assignElevationFromSquare(current, variance);
        }
    }
}

function fillMissedElevation(square) {
    shuffle(directionArray).forEach(side => {
        if (square[side] && square[side].avgElevation) {
            square.avgElevation = square[side].avgElevation;
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
    square.gridColor = getGridColor(square, world.waterLevel, world.currentSeason.name);
    square.gridColorStyle = `rgb(${square.gridColor.r}, ${square.gridColor.g}, ${square.gridColor.b})`;

    let r = 100 - square.avgElevation;
    let g = r;
    let b = r;
    square.elevationStyle = `rgb(${r}, ${g}, ${b})`;

    b = 255 - square.precipitation;
    r = b - 30;
    g = b - 30;
    square.rainfallStyle = `rgb(${r}, ${g}, ${b})`;

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
    const row = globalGrid[heightIndex];

    if (widthIndex > 0) {
        square.w = row[widthIndex - 1];
        square.allSidesArray.push(square.w);
        square.mainSidesArray.push(square.w);

        square.w.e = square;
        square.w.allSidesArray.push(square);
        square.w.mainSidesArray.push(square);

        if (heightIndex > 0) {
            square.nw = globalGrid[heightIndex - 1][widthIndex - 1];
            square.allSidesArray.push(square.nw);

            square.nw.se = square;
            square.nw.allSidesArray.push(square);
        }
    }

    if (heightIndex > 0) {
        square.n = globalGrid[heightIndex - 1][widthIndex];
        square.allSidesArray.push(square.n);
        square.mainSidesArray.push(square.n);

        square.n.s = square;
        square.n.allSidesArray.push(square);
        square.n.mainSidesArray.push(square);

        if (widthIndex < heightIndex - 1) {
            square.ne = globalGrid[heightIndex - 1][widthIndex + 1];
            square.allSidesArray.push(square.ne);

            square.ne.sw = square;
            square.ne.allSidesArray.push(square);
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
        if(precip <= 1) {
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
    const rainAmount = random(1, 3);

    if (rainLeft > 0 && square.avgElevation > world.waterLevel && rainChance > 85) {
        square.precipitation += rainAmount;
        rainLeft -= rainAmount;
        applyPrecipStatsToSquare(square);

    } else if (square.avgElevation <= world.waterLevel) {
        rainLeft += random(.05, .1);
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
        rainType = applyRain;
    }

    scanGridByDirection(world.currentSeason.windDirection, rainType, () => {
        rainLeft = world.currentSeason.rainAmount
    });

    advanceSeason(color);

    return getReturnState();
}

export function applyYearsRain(times = 1, evaporate, color = true) {

    for (let i = 0; i < times; i++) {
        for (let j = 0; j < 4; j++) {
            applySeasonsRain(evaporate, (color && i === times - 1 && j === 3));
        }
    }

    return getReturnState();
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

function testMutationAgainstSquares(plant, squares) {
    for (let index = 0; index < squares.length; index++) {
        plantCompetitionRuns ++;
        competePlantAgainstSquare(squares[index], plant);
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
    let plant = cloneDeep(basePlant);
    plant.id = shortid.generate();
    plant.square = [];
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
    testMutationAgainstSquares(plant, basePlant.squares);
    if(plant.squares.length > 0) {
        return plant;
    }

    return null;
}

export function getMutationsForPlant(plant, number = 1, power = 5) {
    let newPlantIds = [];
    for (let count = 0; count < number; count++) {
        let newPlant = newPlantMutation(plant, power);
        if(newPlant) {
            newPlantIds.push(newPlant.id);
        }
    }

    return newPlantIds;
}

export function mutatePlants(plants, number, power) {
    for (let index = 0; index < plants.length; index++) {
        let plant = plants[index];
        plant.mutations = getMutationsForPlant(plant, number, power);
    }
}

function extinctPlant(plant) {
    plantObj[plant.id].extinct = true;
    remove(plants, (target) => target.id === plant.id);
}

function cullPlants() {
    for (const key in plantObj) {
        let plant = plantObj[key];
        if (!plant.sqaures || plant.square.length <= 0) {
            extinctPlant(plant);
        }
    }
}

function competePlantAgainstSquare(square, plant) {
    plantCompetitionRuns++;
    if(Array.isArray(square.plants)) {
        plant.squares.push(square.index);
        // plant.test = [square.index];
        // plant.test[0] = square;
        // const position = sortedIndexBy(square.plants, plant, 'solarRatio');
        // square.plants.splice(position, 0, plant);
        if (!plantObj[plant.id]) {
            plantObj[plant.id] = plant;
        }

        plantObj[plant.id].extinct = false;
        // if(square.plants.length > 10) {
        //     const removedPlant = square.plants.shift();
        //     remove(removedPlant.squares, (target) => target.id === square.id);
        //     if(removedPlant.squares.length <= 0) {
        //         extinctPlant(removedPlant);
        //     }
        //     removedPlants++;
        // }
    }
}

function testPlantAgainstSquare(square, plant) {
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

    if (avgMinTemp < minTemp) {
        // if(plant.id === 1000) {
        //     console.log('^^^ rejecting TEST_PLANT on temp avgMinTemp < minTemp', avgMinTemp, minTemp);
        // }
        // console.log('Rejecting plant on temp (plant / square)', minTemp, avgMinTemp);
        rejectedOnTemp ++;
        return;
    }

    if (avgPrecip < minPrecip) {
        // if (plant.id === 1000) {
        //     console.log('^^^ rejecting TEST_PLANT on precip avgPrecip < minPrecip', avgPrecip, minPrecip);
        // }
        rejectedOnPrecip ++;
        // console.log('Rejecting plant on precip (plant / square)', minPrecip, avgMinPrecip);
        return;
    }

    if (maxDroughtLength > droughtTolerance) {
        // if (plant.id === 1000) {
        //     console.log('^^^ rejecting TEST_PLANT on drought maxDroughtLength > droughtTolerance', maxDroughtLength, droughtTolerance);
        // }
        rejectedOnDrought ++;
        // console.log('Rejecting plant on drought (plant / square)', droughtTolerance, maxDroughtLength);
        return;
    }

    competePlantAgainstSquare(square, plant);
}

function assignPlantsToSquare(square) {
    if (square.avgElevation <= world.waterLevel) {
        return;
    }

    for (let index = 0; index < plantArray.length; index++) {
        const plant = plantArray[index];
        testPlantAgainstSquare(square, plant);
    }
}

function assignOrganismsToSquare(square) {
    assignPlantsToSquare(square);
    assignGridColorToSquare(square);
}

function assignOrganismsToGrid() {
    loopGrid(assignOrganismsToSquare);
    console.log('rejectedOnTemp', rejectedOnTemp);
    console.log('rejectedOnPrecip', rejectedOnPrecip);
    console.log('rejectedOnDrought', rejectedOnDrought);

    console.log('removedPlants', removedPlants);
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
    world.waterLevel = -50;

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
            gridArray: globalGrid,
            zoomArray: globalZoomArray,
            height: mapHeight,
            width: mapWidth,
            mapZoomHeight,
            mapZoomWidth,
            isZoomed
        }
    }
}

// Handles initial setup of a new world. Can be passed an optional pre-defined mock grid or world-params for testing
export function initNewWorld(worldOptions) {
    let t1 = performance.now();
    const{height, width, zoomLevel, waterLevel, grid, woldParams} = worldOptions;

    mapHeight = height;
    mapWidth = width;

    initNewWorldParams(zoomLevel, waterLevel);  //Set random world parameters

    if(!grid) {
        setRandomGlobalGrid(height, width);
    } else {
        globalGrid = grid;
    }

    assignSidesToGrid();

    // assignFromLeft();

    let randomSquare = getRandomFromGrid();
    assignElevationFromSquare(randomSquare, 2);

    applyYearsRain(40, false, false);

    assignOrganismsToGrid();
    cullPlants();

    mutatePlants(plantArray);
    console.log('Plant Array', plantArray);
    console.log('Plant Object', plantObj);
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
        globalZoomArray = [];
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
            row.push(newZoomSquare(globalGrid[heightIndex][index]));
            innerCount ++;
        }

        globalZoomArray.push(row);
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
