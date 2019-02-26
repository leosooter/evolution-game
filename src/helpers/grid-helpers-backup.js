/*
Grid building process
1) create new grid
    a) create grid of blank squares --- Full Grid Loop
    b) Spread elevation --- Full recursive

2) assign sides, temp, colors
    --- linear loop
        check for/ correct missing elevation
        assign sides
        assign temp
        assign color










set global world data
create grid - requires height, width
add elevation - requires full grid -- recusive
fill missed spaces in elevation - requires full grid -- linear loop
add side relationships - requires full grid -- linear loop
add temp - requires *elevation* -- linear loop
add colors - requires *elevation, temp* -- linear loop

*/



import {sample, shuffle, clamp} from "lodash";
import {applyYearlyRain, getGridColor, colorTracker, randomColor} from "./color-helpers";
import {worldColorsGrid} from "../config/colors-config";
import {random} from "./utilities";
import gridMocks from "../../mocks/grid-mocks";

const directionArray = ["e", "s", "w", "n"];
const squareSideArray = ["e", "s", "w", "n", "ne", "nw", "se", "sw"];
// const seasons = [];
const world = {};
let globalGrid = {
    linearArray: [],
    gridArray: []
};
// let gridArray = [];
// let linearArray = [];

function getElevation(currentElevation, power) {
    let plusMinus = [-1, 1];
    let multiplier = sample(plusMinus);

    multiplier = currentElevation > 90 ? -1 : multiplier;
    multiplier = currentElevation < -20 ? 1 : multiplier;
    const diff = random(power) * multiplier;

    let finalElevation = currentElevation + diff;

    if(finalElevation > 100) {
        finalElevation = 100;
    }

    return finalElevation;
}

function spreadElevationFromPoint(current, power) {
    const direction = shuffle(directionArray);

    if (current[direction[0]] && !current[direction[0]].avgElevation) {
        current[direction[0]].avgElevation = getElevation(current.avgElevation, power);
        current = current[direction[0]];
        spreadElevationFromPoint(current, power);
    }

    if (current[direction[1]] && !current[direction[1]].avgElevation) {
        current[direction[1]].avgElevation = getElevation(current.avgElevation, power);
        current = current[direction[1]];
        spreadElevationFromPoint(current, power);
    }

    if (current[direction[2]] && !current[direction[2]].avgElevation) {
        current[direction[2]].avgElevation = getElevation(current.avgElevation, power);
        current = current[direction[2]];
        spreadElevationFromPoint(current, power);
    }

    if (current[direction[3]] && !current[direction[3]].avgElevation) {
        current[direction[3]].avgElevation = getElevation(current.avgElevation, power);
        current = current[direction[3]];
        spreadElevationFromPoint(current, power);
    }
}

export function newSquare(index, latitude, options={}) { // options param is used to generate set-value squares for mocks
    const {setElevation, setTemp, setPrecip} = options;

    let square = {
        avgElevation: setElevation || null,
        waterElevation: 0,
        // avgElevation: random(1,100),
        precipitation: setPrecip || 0,
        baseTemp: setTemp || 0,
        avgElevationChange: random(1, 100),
        index,
        latitude,
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

function assignColors() {
    for (let index = 0; index < globalGrid.linearArray.length; index++) {
        const square = globalGrid.linearArray[index];

        if(!square.avgElevation) {

        }

        let latitudeAdjust = (square.latitude * world.zoomLevel) / 3.7;
        let elevationAdjust = square.avgElevation * 1.2;
        let globalTemp = 140;

        square.baseTemp = Math.floor(globalTemp - (latitudeAdjust + elevationAdjust));
        square.baseTemp = square.baseTemp > 100 ? 100 : square.baseTemp;

        square.groundColor = applyYearlyRain(square);
        square.groundColorStyle = `rgb(${square.groundColor.r}, ${square.groundColor.g}, ${square.groundColor.b})`;

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
}

function findLowestSide(square) {
    let lowSideHeight = square.avgElevation + square.waterElevation;
    let lowSide = null;
    let levelSides = [];

    for (let i = 0; i < squareSideArray.length; i++) {
        const side = square[squareSideArray[i]];

        if (side && side.avgElevation + side.waterElevation < lowSideHeight) {
            // console.log('setting lowSide to', side.avgElevation);

            lowSideHeight = side.avgElevation + side.waterElevation;
            lowSide = side;
        } else if (side && side.avgElevation + side.waterElevation === square.avgElevation + square.waterElevation) {
            levelSides.push(side);
        }
    }

    square.lowSide = lowSide;

    return square;
}

function assignSlopeToGrid() {
    for (let index = 0; index < globalGrid.linearArray.length; index++) {
        // console.log('globalGrid.linearArray', globalGrid.linearArray);

        let square = globalGrid.linearArray[index];
        // console.log('square', square);

        square = findLowestSide(square);
    }
}

export function assignSides(square, xCoord, yCoord) {
    if (xCoord > 0) {
        square.w = row[xCoord - 1];
        square.w.e = square;

        if (yCoord > 0) {
            square.nw = globalGrid.gridArray[yCoord - 1][xCoord - 1];
            square.nw.se = square;
        }
    }

    if (yCoord > 0) {
        square.n = globalGrid.gridArray[yCoord - 1][xCoord];
        square.n.s = square;

        if (xCoord < height - 1) {
            square.ne = globalGrid.gridArray[yCoord - 1][xCoord + 1];
            square.ne.sw = square;
        }
    }
}

export function createGrid(height, width) {
    globalGrid.height = height;
    globalGrid.width = width;

    let index = 0;
    for (let yCoord = 0; yCoord < height; yCoord++) {
        let row = [];
        for (let xCoord = 0; xCoord < width; xCoord++) {
            const latitude = height - yCoord;
            const square = newSquare(index, latitude);

            row.push(square);
            globalGrid.linearArray.push(square);
            index++;
        }
        globalGrid.gridArray.push(row);
    }
}

export const getInitialGrid = (xSquares, ySquares) => {
    setSeasons();
    let index = 0;

    for (let x = 0; x < xSquares; x++) {
        let row = [];
        for (let y = 0; y < ySquares; y++) {
            const latitude = xSquares - x;
            const square = newSquare(index, latitude);

            if (y > 0) {
                square.w = row[y - 1];
                square.w.e = square;

                if (x > 0) {
                    square.nw = globalGrid.gridArray[x - 1][y - 1];
                    square.nw.se = square;
                }
            }
            if (x > 0) {
                square.n = globalGrid.gridArray[x - 1][y];
                square.n.s = square;

                if (y < ySquares - 1) {
                    square.ne = globalGrid.gridArray[x - 1][y + 1];
                    square.ne.sw = square;
                }
            }

            row.push(square);
            globalGrid.linearArray.push(square);
            index++;
        }
        globalGrid.gridArray.push(row);
    }

    let start = globalGrid.linearArray[0];
    start.avgElevation = random(0,100);

    // spreadElevationFromPoint(start, world.elevationChange);
    spreadElevationFromPoint(start, world.zoomLevel);
    assignSlopeToGrid();
    // applyYearsRain(1);
    assignColors();

    console.log('globalGrid.linearArray', globalGrid.linearArray);
};

function flowWater(square) {
    // If square has lowSide - flow all excess to lowSide
    //If square has levelSide with lower water level, equalize the water level
    let excessWater = square.precipitation - 100;
    square.waterElevation = excessWater;
    findLowestSide(square);
    if(square.lowSide) {
        console.log("flowing to low side VVVVVVVVV");

        let lower = square.lowSide;
        square.precipitation = 100;
        lower.precipitation += excessWater;

        if (lower.precipitation > 100 && square.avgElevation > 0 && lower.lowSide) {
            flowWater(lower);
        }
    } else if (square.levelSides && square.levelSides.length) {
        square.levelSides.forEach(side => {
            if(side.precipitation < square.precipitation) {
                console.log("flowing to level side -----");
                let diff = Math.floor((square.precipitation - side.precipitation) / 2);
                diff = diff > excessWater ? excessWater : diff

                square.precipitation -= diff;
                side.precipitation = square.precipitation;
                side.avgElevation -= 1;

                if (side.precipitation > 100 && square.avgElevation > 0) {
                    flowWater(side);
                }
            }
        });
    }
}

function spreadWater() {
    globalGrid.linearArray.forEach(square => {
        if (square.precipitation > 100 && square.avgElevation > 0) {
            flowWater(square);
        }
    });
}

function applyRain(square, rainLeft, takeWater) {
    // const elevationBonus = Math.floor(square.avgElevation / 20);
    const elevationBonus = Math.floor(square.avgElevation / 4);
    const maxChance = 95 + elevationBonus;
    const rainChance = random(1, maxChance);
    const rainAmount = random(1, 3);

    if (rainLeft > 0 && square.avgElevation > 0 && rainChance > 85) {
        square.precipitation += rainAmount;
        rainLeft -= rainAmount;
        let evaporation = 2;

        if (takeWater && square.precipitation) {
            square.precipitation -= evaporation;
            square.precipitation = clamp(square.precipitation, 0, 150);
        }

    } else if (square.avgElevation <= 0) {
        rainLeft += random(.05, .1);
    }
    // else if (rainLeft <= 0 && random(1, 5) === 5) {
    //     square.precipitation += random(1, 3);
    // }

    return rainLeft;
}

function sendRainE(amount, takeWater) {
    for (let i = 0; i < globalGrid.gridArray.length; i++) {
        let row = globalGrid.gridArray[i];
        let rainLeft = amount;
        for (let j = 0; j < row.length; j++) {
            const square = row[j];
            rainLeft = applyRain(square, rainLeft, takeWater);
        }
        // console.log('rainLeft', rainLeft);
        // console.log('Rain applied', amount - rainLeft);
    }
}

function sendRainW(amount, takeWater) {
    for (let i = 0; i < globalGrid.gridArray.length; i++) {
        let row = globalGrid.gridArray[i];
        let rainLeft = amount;
        for (let j = 0; j < row.length; j++) {
            const square = row[j];
            rainLeft = applyRain(square, rainLeft);
        }
    }
}

function sendRainN(amount, takeWater) {
    for (let i = 0; i < globalGrid.gridArray.length; i++) {
        let row = globalGrid.gridArray[i];
        let rainLeft = amount;
        for (let j = 0; j < row.length; j++) {
            const square = row[j];
            rainLeft = applyRain(square, rainLeft);
        }
    }
}

function sendRainS(amount, takeWater) {
    for (let i = 0; i < globalGrid.gridArray.length; i++) {
        let row = globalGrid.gridArray[i];
        let rainLeft = amount;
        for (let j = 0; j < row.length; j++) {
            const square = row[j];
            rainLeft = applyRain(square, rainLeft);
        }
    }
}

export function applyYearsRain(times = 1, takeWater = true) {
    for (let i = 0; i < times; i++) {
        for (let seasonIndex = 0; seasonIndex < 4; seasonIndex++) {
            let season = world.seasons[seasonIndex];
            applySeasonsRain(season, takeWater);
        }
    }

    assignColors();
}

export function applySeasonsRain(season, takeWater) {

        const windDirection = season.windDirection;

        if (windDirection === "e") {
            sendRainE(season.rainAmount, takeWater);
        } else if (windDirection === "w") {
            sendRainE(season.rainAmount, takeWater);
        } else if (windDirection === "n") {
            sendRainE(season.rainAmount, takeWater);
        } else if (windDirection === "s") {
            sendRainE(season.rainAmount, takeWater);
        }

        spreadWater();
}

export function setSeasons(moisture, temp) {
    const seasons = [];
    for (let index = 0; index < 4; index++) {
        seasons.push({
            windDirection: sample(directionArray),
            rainAmount: random(1, 30) + moisture
        });
    }

    return seasons;
}

export function initNewWorld(xSquares, ySquares) {
    // world.elevationChange = random(1, 20);
    world.globalMoisture = random(5, 20);
    world.globalTemp = random(-20,20) / 10; //-2.0 - 2.0
    world.seasons = setSeasons(world.globalMoisture, world.globalTemp);
    world.zoomLevel = 2;
    globalGrid.width = xSquares;
    globalGrid.height = ySquares;
    getInitialGrid(xSquares, ySquares)

    return {
        environmentGrid: [],
        organismList: [],
        selectedSquare: null,
        selectedEnvironment: {
            precipitation: 40,
            avgElevation: 20,
            elevationChange: 30,
            baseTemp: 50,
            color: randomColor("green")
        },
        world: {
            ...world,
            worldColorsGrid,
            seasons: setSeasons()
        },
        numSeasons: 0,
        worldColorsGrid,
        grid: globalGrid
    }
}

export function initMockWorld(mockGrid) {
    // world.elevationChange = random(1, 20);
    world.globalMoisture = random(5, 20);
    world.globalTemp = random(-20, 20) / 10; //-2.0 - 2.0
    world.seasons = setSeasons(world.globalMoisture, world.globalTemp);
    world.zoomLevel = 2;
    globalGrid.width = mockGrid.length;
    globalGrid.height = mockGrid.length;
    getInitialGrid(xSquares, ySquares)

    return {
        environmentGrid: [],
        organismList: [],
        selectedSquare: null,
        selectedEnvironment: {
            precipitation: 40,
            avgElevation: 20,
            elevationChange: 30,
            baseTemp: 50,
            color: randomColor("green")
        },
        world: {
            ...world,
            worldColorsGrid,
            seasons: setSeasons()
        },
        numSeasons: 0,
        worldColorsGrid,
        grid: globalGrid
    }
}
