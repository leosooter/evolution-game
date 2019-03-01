import {sample, shuffle, clamp} from "lodash";
import {applyYearlyRain, getGridColor, colorTracker, randomColor} from "./color-helpers";
import {worldColorsGrid} from "../config/colors-config";
import {random} from "./utilities";
import gridMocks from "../../mocks/grid-mocks";

const directionArray = ["e", "s", "w", "n"];
const squareSideArray = ["e", "s", "w", "n", "ne", "nw", "se", "sw"];
const world = {};
const startingTemp = 100;
const EVAPORATION_RATE = .2;
let globalGrid = [];
let rainLeft;
let totalSeasons = 0;
let cornerRadius = 30;
let baseTemp;
let mapHeight;
let mapWidth;
let recursionCount = 1000;

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

function trackFromPoint(square, callback, direction, distance) {
    let current = square;

    for (let index = 0; index < distance; index++) {
        callback(current);
        if(!current[direction]) {
            break;
        }

        current = current[direction];
    }

    return current;
}

function spriralFromPoint(square, callBack, power, random = true) {
    let current = square;
    for (let i = 0; i < power; i++) {
        for (let j = 0; j < directionArray.length; j++) {
            return;
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
        se: null
    }

    return square;
}

function setRandomGlobalGrid(height, width) {
    let t0 = performance.now();
    let index = 0;

    for (let gridHeight = 0; gridHeight < height; gridHeight++) {
        const row = [];

        for (let gridWidth = 0; gridWidth < width; gridWidth++) {
            row.push(newSquare(index, gridWidth, gridHeight));
            index ++;
        }

        globalGrid.push(row);
    }
    let t1 = performance.now();

    console.log('setRandomGlobalGrid time', t1 - t0);

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

// function assignElevationFromSquare(current, variance) {
//     recursionCount--;

//     const shuffledDirectionArray = shuffle(current.mainSidesArray);

//     for (let index = 0; index < shuffledDirectionArray.length; index++) {
//         let side = shuffledDirectionArray[index];
//         if (!side.avgElevation && recursionCount > 0) {
//             side.avgElevation = getElevation(current.avgElevation, variance);
//             current = side;
//             assignElevationFromSquare(current, variance);
//         }
//     }
// }

function assignElevationFromSquare(current, variance) {
    recursionCount --;

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

function assignElevationFromPointsOnGrid(times, variance, depth = 1000) {
    for (let index = 0; index < times; index++) {
        recursionCount = depth;
        let randomSquare = getRandomFromGrid();
        randomSquare.avgElevation = random(-20,80);

        assignElevationFromSquare(randomSquare, variance);
    }
}

// function assignElevationFromSquare2(current, power) {
//     const shuffledDirectionArray = shuffle(squareSideArray);
//     let nextArray = []

//     for (let index = 0; index < shuffledDirectionArray.length; index++) {
//         if (current[shuffledDirectionArray[0]] && !current[shuffledDirectionArray[0]].avgElevation) {
//             current[shuffledDirectionArray[0]].avgElevation = getElevation(current.avgElevation, power);

//         }
//     }
// }

// function assignElevationFromPoint(square, power) {
//     let assignArray = [square];
//     let length = power;
//     for (let i = 0; i < length; i++) {
//         const current = assignArray[i];

//         let sideIndex = 0;
//         let sideLength = square.mainSidesArray.length;

//         for (sideIndex; sideIndex < sideLength;sideIndex++) {
//             let side = current.mainSidesArray[sideIndex]
//             if (!side.avgElevation) {
//                 side.avgElevation = 100;
//             }
//         }
//     }
// }

// function assignElevationFromPointsOnGrid(times, power) {
//     for (let index = 0; index < times; index++) {
//         let square = getRandomFromGrid();
//         assignElevationFromPoint(square, power);
//     }
// }

function linkedListElevationAssign(start, power) {
    let current = start;
    let safety = 10000;

    while(current && safety > 0) {
        safety --;


    }
}

function fillMissedElevation(square) {
    // console.log('fillMissedElevation', square.index);

    shuffle(directionArray).forEach(side => {
        if (square[side] && square[side].avgElevation) {
            square.avgElevation = square[side].avgElevation;
            return;
        }
    });
}

function assignTempToSquare(square) {
    // let latitudeAdjust = (square.latitude * world.zoomLevel) / 3.7;
    // let elevationAdjust = square.avgElevation * 1.2;
    let heightIndex = square.heightIndex > 0 ? square.heightIndex : 1;
    let elevation = square.avgElevation > 0 ? square.avgElevation : 1;
    // console.log('mapHeight', mapHeight);

    let latitudeAdjust = (heightIndex / mapHeight);
    let elevationAdjust = ((100 - elevation) / 100);
    // let latitudeAdjust = 1;

    // console.log('heightIndex', square.heightIndex, 'latitudeAdjust', latitudeAdjust);
    // console.log('avgElevation', square.avgElevation, 'elevationAdjust', elevationAdjust);
    square.baseTemp = Math.floor((baseTemp * latitudeAdjust ) * elevationAdjust);
    // square.baseTemp = square.baseTemp > 100 ? 100 : square.baseTemp;
    square.baseTemp = clamp(square.baseTemp, 0, 100);
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
    square.gridColor = getGridColor(square, world.waterLevel);
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

    if(square.avgElevation > world.waterLevel) {
        roundWaterCorners(square);
    }
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

function applyRain(square) {
    const elevationBonus = Math.floor(square.avgElevation / 4);
    const maxChance = 95 + elevationBonus;
    const rainChance = random(1, maxChance);
    const rainAmount = random(1, 3);

    if (rainLeft > 0 && square.avgElevation > world.waterLevel && rainChance > 85) {
        square.precipitation += rainAmount;
        rainLeft -= rainAmount;
        assignGridColorToSquare(square);

    } else if (square.avgElevation <= world.waterLevel) {
        rainLeft += random(.05, .1);
    }
}

function applyEvaporation(square) {
    if (square.avgElevation > world.waterLevel && square.precipitation) {
        square.precipitation -= EVAPORATION_RATE;
        square.precipitation = clamp(square.precipitation, 0, 150);
        assignGridColorToSquare(square);
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

    scanGridByDirection(world.currentSeason.windDirection, rainType, () => {
        rainLeft = world.currentSeason.rainAmount
    });
    advanceSeason();

    return getReturnState();
}

export function applyYearsRain(times = 1, evaporate) {

    for (let i = 0; i < times; i++) {
        for (let j = 0; j < 4; j++) {
            applySeasonsRain(evaporate);
        }
    }

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


/////////////////////////////////// World Params
export function setSeasons(moisture, temp) {
    const winterColor = "rgb(165, 220, 255)";
    const springColor = "rgb(165, 255, 135)";
    const summerColor = "rgb(250, 244, 87)";
    const fallColor = "rgb(255, 204, 87)";

    const winterSeason = {
        name: "Winter",
        avgTemp: .5,
        windDirection: sample(directionArray),
        rainAmount: random(10, 20) + moisture,
        backgroundColor: winterColor,
        index: 0
    }

    const springSeason = {
        name: "Spring",
        avgTemp: 1.3,
        windDirection: sample(directionArray),
        rainAmount: random(0, 20) + moisture,
        backgroundColor: springColor,
        index: 1
    }

    const summerSeason = {
        name: "Summer",
        avgTemp: 2,
        windDirection: sample(directionArray),
        rainAmount: random(0, 10) + moisture,
        backgroundColor: summerColor,
        index: 2
    }

    const fallSeason = {
        name: "Fall",
        avgTemp: .8,
        windDirection: sample(directionArray),
        rainAmount: random(10, 30) + moisture,
        backgroundColor: fallColor,
        index: 3
    }

    return [winterSeason, springSeason, summerSeason, fallSeason];
}

export function advanceSeason() {

    let currentIndex = world.currentSeason.index;
    if(currentIndex === 3) {
        world.currentSeason = world.seasons[0];
    } else {
        world.currentSeason = world.seasons[currentIndex + 1];
    }

    const tempModifier = world.currentSeason.avgTemp + random(-0.2, 0.2);
    baseTemp = Math.ceil((startingTemp * world.globalTemp) * tempModifier);
    assignTempAndColor();

    totalSeasons ++;

    return getReturnState();
}

export function initNewWorldParams(zoomLevel, waterLevel) {
    world.globalMoisture = random(5, 20);
    // world.globalTemp = random(.8, 1.2);
    world.globalTemp = 1;
    world.seasons = setSeasons(world.globalMoisture, world.globalTemp);
    world.currentSeason = world.seasons[0];
    world.zoomLevel = zoomLevel;
    world.waterLevel = waterLevel;

    const tempModifier = world.currentSeason.avgTemp + random(-0.2, 0.2);
    baseTemp = Math.ceil((startingTemp * world.globalTemp) * tempModifier);
}


function getReturnState() {
    return {
        selectedSquare: null,
        world: {
            ...world,
            seasons: setSeasons(),
            avgTemp: baseTemp,
        },
        totalSeasons,
        worldColorsGrid,
        grid: {
            gridArray: globalGrid,
            height: mapHeight,
            width: mapWidth
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

    assignElevationFromPointsOnGrid(100, 2, 1000);

    // let randomSquare = getRandomFromGrid();
    // assignElevationFromSquare(randomSquare, 2);

    // //If a mock grid was not passed, or the mock grid does not set elevation, randomly generate elevation
    // if (!randomSquare.avgElevation) {
    //     assignElevationFromSquare(randomSquare, 2);
    // }

    // If a mock grid was not passed, or the mock grid does not set temp, assign temp and color
    // if (!randomSquare.baseTemp) {
    //     assignTempAndColor();
    // } else {
    //     assignGridColorsToGrid(); // If grid with pre-set temp was passed - only assign color
    // }

    assignTempAndColor();
    let t2 = performance.now();

    console.log('Init time', t2 - t1);

    return getReturnState();
}
