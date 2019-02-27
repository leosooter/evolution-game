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
let totalSeasons = 0;

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
        allSidesArray: [],
        mainSidesArray: [],
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

function assignElevationFromSquare(current, power) {
    // const direction = shuffle(directionArray);

    // if (current[direction[0]] && !current[direction[0]].avgElevation) {
    //     current[direction[0]].avgElevation = getElevation(current.avgElevation, power);
    //     current = current[direction[0]];
    //     assignElevationFromSquare(current, power);
    // }

    // if (current[direction[1]] && !current[direction[1]].avgElevation) {
    //     current[direction[1]].avgElevation = getElevation(current.avgElevation, power);
    //     current = current[direction[1]];
    //     assignElevationFromSquare(current, power);
    // }

    // if (current[direction[2]] && !current[direction[2]].avgElevation) {
    //     current[direction[2]].avgElevation = getElevation(current.avgElevation, power);
    //     current = current[direction[2]];
    //     assignElevationFromSquare(current, power);
    // }

    // if (current[direction[3]] && !current[direction[3]].avgElevation) {
    //     current[direction[3]].avgElevation = getElevation(current.avgElevation, power);
    //     current = current[direction[3]];
    //     assignElevationFromSquare(current, power);
    // }
    const shuffledDirectionArray = shuffle(current.mainSidesArray);

    for (let index = 0; index < shuffledDirectionArray.length; index++) {
        let side = shuffledDirectionArray[index];
        if (!side.avgElevation) {
            side.avgElevation = getElevation(current.avgElevation, power);
            current = side;
            assignElevationFromSquare(current, power);
        }
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

    assignTempToSquare(square);
}

//fill in any missed elevation and assign temp
function assignTempToGrid() {
    loopGrid(assignTempAndFillMissedElevationToSquare)
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
        square.precipitation -= 2;
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
}

export function applyYearsRain(times = 1, evaporate) {

    for (let i = 0; i < times; i++) {
        for (let j = 0; j < 4; j++) {
            applySeasonsRain(evaporate);
        }
    }
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

    totalSeasons ++;
}

export function initNewWorldParams(zoomLevel, waterLevel) {
    world.globalMoisture = random(5, 20);
    world.globalTemp = random(-20, 20) / 10; //-2.0 - 2.0
    world.seasons = setSeasons(world.globalMoisture, world.globalTemp);
    world.currentSeason = world.seasons[0];
    world.zoomLevel = zoomLevel;
    world.waterLevel = waterLevel;
}

// Handles initial setup of a new world. Can be passed an optional pre-defined mock grid or world-params for testing
export function initNewWorld(worldOprions) {
    const{height, width, zoomLevel, waterLevel, grid, woldParams} = worldOprions;
    initNewWorldParams(zoomLevel, waterLevel);  //Set random world parameters

    if(!grid) {
        setRandomGlobalGrid(height, width);
    } else {
        globalGrid = grid;
    }

    assignSidesToGrid();

    let randomSquare = getRandomFromGrid();

    //If a mock grid was not passed, or the mock grid does not set elevation, randomly generate elevation
    if (!randomSquare.avgElevation) {
        assignElevationFromSquare(randomSquare, 2);
    }

    //If a mock grid was not passed, or the mock grid does not set temp, assign temp and color
    if (!randomSquare.baseTemp) {
        assignTempAndColor();
    } else {
        assignGridColorsToGrid(); // If grid with pre-set temp was passed - only assign color
    }

    return {
        selectedSquare: null,
        world: {
            ...world,
            seasons: setSeasons()
        },
        totalSeasons,
        worldColorsGrid,
        grid: {
            gridArray: globalGrid,
            height,
            width
        }
    }
}
