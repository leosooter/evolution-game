import {sample, shuffle, clamp} from "lodash";
import {applyYearlyRain, getGridColor, colorTracker, randomColor} from "./color-helpers";
import {worldColorsGrid} from "../config/colors-config";
import {random} from "./utilities";
import gridMocks from "../../mocks/grid-mocks";

const directionArray = ["e", "s", "w", "n"];
const squareSideArray = ["e", "s", "w", "n", "ne", "nw", "se", "sw"];
const world = {};
let globalGrid = [];
let rainLeft;


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

export function newSquare(index, widthIndex, heightIndex, options={}) { // options param is used to generate set-value squares for mocks
    const {setElevation, setTemp, setPrecip} = options;

    let square = {
        avgElevation: setElevation || null,
        waterElevation: 0,
        precipitation: setPrecip || 0,
        baseTemp: setTemp || 0,
        index,
        latitude : null,
        widthIndex,
        heightIndex,
        n: null,
        s: null,
        e: null,
        w: null,
        nw: null,
        ne: null,
        sw: null,
        se: null
    }

    return square;
}

function setRandomGlobalGrid(height, width) {
    let index = 0;

    for (let gridHeight = 0; gridHeight < height; gridHeight++) {
        const row = [];

        for (let gridWidth = 0; gridWidth < width; gridWidth++) {
            row.push(newSquare(index, gridWidth, gridHeight));
        }

        globalGrid.push(row);
    }
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

function assignElevationFromSquare(current, power) {
    const shuffledDirectionArray = shuffle(directionArray);

    for (let index = 0; index < shuffledDirectionArray.length; index++) {
        if (current[shuffledDirectionArray[0]] && !current[shuffledDirectionArray[0]].avgElevation) {
            current[shuffledDirectionArray[0]].avgElevation = getElevation(current.avgElevation, power);
            current = current[shuffledDirectionArray[0]];
            assignElevationFromSquare(current, power);
        }
    }
}

function fillMissedElevation(square) {
    shuffle(squareSideArray).forEach(side => {
        if(square[side]) {
            square.avgElevation = square[side].avgElevation;
            return;
        }
    });
}

function assignTemp(square) {
    let latitudeAdjust = (square.latitude * world.zoomLevel) / 3.7;
    let elevationAdjust = square.avgElevation * 1.2;
    let globalTemp = 140;
    square.baseTemp = Math.floor(globalTemp - (latitudeAdjust + elevationAdjust));
    square.baseTemp = square.baseTemp > 100 ? 100 : square.baseTemp;
}

function assignTempAndFillMissedElevationToSquare(square) {
    if(!square.avgElevation) {
        fillMissedElevation(square);
    }

    assignTemp(square);
}

//fill in any missed elevation and assign temp
function assignTempToGrid() {
    loopGrid(assignTempAndFillMissedElevation)
}


//////////////////////////////////// Colors
function assignGridColorToSquare(square) {
    square.gridColor = getGridColor(square);
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
    g = 0;
    b = 255 - square.baseTemp;
    square.temperatureStyle = `rgb(${r}, ${g}, ${b})`;
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
        square.w.e = square;

        if (heightIndex > 0) {
            square.nw = globalGrid[heightIndex - 1][widthIndex - 1];
            square.nw.se = square;
        }
    }

    if (heightIndex > 0) {
        square.n = globalGrid[heightIndex - 1][widthIndex];
        square.n.s = square;

        if (widthIndex < heightIndex - 1) {
            square.ne = globalGrid[heightIndex - 1][widthIndex + 1];
            square.ne.sw = square;
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

function applyRain(square) {
    const elevationBonus = Math.floor(square.avgElevation / 4);
    const maxChance = 95 + elevationBonus;
    const rainChance = random(1, maxChance);
    const rainAmount = random(1, 3);

    if (rainLeft > 0 && square.avgElevation > 0 && rainChance > 85) {
        square.precipitation += rainAmount;
        rainLeft -= rainAmount;

    } else if (square.avgElevation <= 0) {
        rainLeft += random(.05, .1);
    }
}

function applyEvaporation(square) {
    if (square.avgElevation > 0 && square.precipitation) {
        square.precipitation -= 2;
        square.precipitation = clamp(square.precipitation, 0, 150);
    }
}

export function applyRainAndEvaporation(square) {
    applyRain(square);
    applyEvaporation(square);
}



export function applySeasonsRain(evaporate) {
    let rainType = applyRainAndEvaporation;
    if(!evaporate) {
        rainType = applyRain;
    }

    scanGridByDirection(world.currentSeason.windDirection, rainType, () => {rainLeft = world.currentSeason.rainAmount});
    advanceSeason();
}

export function applyYearsRain(times = 1, evaporate) {
    for (let i = 0; i < times; i++) {
        applySeasonsRain(evaporate);
    }
}

//////////////////////////////////// Initialize

function assignTempAndColor() {
    loopGrid(
        (square) => {
            assignTempAndFillMissedElevationToSquare(square);
            assignGridColorToSquare(square);
        }
    )
}


/////////////////////////////////// World Params
export function setSeasons(moisture, temp) {
    const seasons = [];
    for (let index = 0; index < 4; index++) {
        seasons.push({
            windDirection: sample(directionArray),
            rainAmount: random(1, 30) + moisture,
            index
        });
    }

    return seasons;
}

function advanceSeason() {
    let currentIndex = world.currentSeason.index;
    if(currentIndex === 3) {
        world.currentSeason = world.seasons[0];
    } else {
        world.currentSeason = world.seasons[currentIndex + 1];
    }
}

export function initNewWorldParams() {
    world.globalMoisture = random(5, 20);
    world.globalTemp = random(-20, 20) / 10; //-2.0 - 2.0
    world.seasons = setSeasons(world.globalMoisture, world.globalTemp);
    world.currentSeason = world.seasons[0];
    world.zoomLevel = 2;
}

export function initNewWorld(height, width, grid) {
    initNewWorldParams();
    if(!grid) {
        setRandomGlobalGrid(height, width);
    } else {
        globalGrid = grid;
    }

    assignSidesToGrid();

    let randomSquare = getRandomFromGrid();
    assignElevationFromSquare(randomSquare, 2);
    assignTempAndColor();

    return {
        selectedSquare: null,
        world: {
            ...world,
            seasons: setSeasons()
        },
        numSeasons: 0,
        worldColorsGrid,
        grid: {
            gridArray: globalGrid,
            height,
            width
        }
    }
}
