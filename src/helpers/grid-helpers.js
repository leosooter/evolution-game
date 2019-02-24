import {sample, shuffle, clamp} from "lodash";
import {applyYearlyRain, getGridColor, colorTracker, randomColor} from "./color-helpers";
import {worldColorsGrid} from "../config/colors-config";
import {random} from "./utilities";

const directionArray = ["e", "s", "w", "n"];
// const seasons = [];
const world = {};
// let gridArray = [];
let linearArray = [];

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

function newSquare(index, latitude) {
    let square = {
        avgElevation: null,
        // avgElevation: random(1,100),
        precipitation: 0,
        baseTemp: 0,
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

function assignColors(linearArray) {
    for (let index = 0; index < linearArray.length; index++) {
        const square = linearArray[index];

        if(!square.avgElevation) {
            if(square.e) {
                square.avgElevation = square.e.avgElevation;
            }
            else if(square.s) {
                square.avgElevation = square.s.avgElevation;
            }
            else if(square.w) {
                square.avgElevation = square.w.avgElevation;
            }
            else if(square.n) {
                square.avgElevation = square.n.avgElevation;
            }

        }
        let latitudeAdjust = (square.latitude * world.zoomLevel) / 3;
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

export const getInitialGrid = (xSquares, ySquares) => {
    let gridArray = [];
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
                    square.nw = gridArray[x - 1][y - 1];
                    square.nw.se = square;
                }
            }
            if (x > 0) {
                square.n = gridArray[x - 1][y];
                square.n.s = square;

                if (y < ySquares - 1) {
                    square.ne = gridArray[x - 1][y + 1];
                    square.ne.sw = square;
                }
            }

            row.push(square);
            linearArray.push(square);
            index++;
        }
        gridArray.push(row);
    }

    let start = linearArray[0];
    start.avgElevation = random(0,100);

    // spreadElevationFromPoint(start, world.elevationChange);
    spreadElevationFromPoint(start, world.zoomLevel);
    // applyYearsRain(1, gridArray);
    assignColors(linearArray);

    return {
        width: xSquares,
        height: ySquares,
        gridArray,
        linearArray
    }
};

function applyRain(square, rainLeft, takeWater) {
    // const elevationBonus = Math.floor(square.avgElevation / 20);
    const elevationBonus = Math.floor(square.avgElevation / 4);
    const maxChance = 95 + elevationBonus;
    const rainChance = random(1, maxChance);
    const rainAmount = random(1, 3);

    if (rainLeft > 0 && square.avgElevation > 0 && rainChance > 85) {
        square.precipitation += rainAmount;
        rainLeft -= rainAmount;

        if (takeWater && square.precipitation >= 2) {
            square.precipitation -= 2;
        }
    } else if (square.avgElevation <= 0) {
        rainLeft += random(.05, .1);
    }
    // else if (rainLeft <= 0 && random(1, 5) === 5) {
    //     square.precipitation += random(1, 3);
    // }

    return rainLeft;
}

function sendRainE(amount, gridArray, takeWater) {
    for (let i = 0; i < gridArray.length; i++) {
        let row = gridArray[i];
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
    for (let i = 0; i < gridArray.length; i++) {
        let row = gridArray[i];
        let rainLeft = amount;
        for (let j = 0; j < row.length; j++) {
            const square = row[j];
            rainLeft = applyRain(square, rainLeft);
        }
    }
}

function sendRainN(amount, takeWater) {
    for (let i = 0; i < gridArray.length; i++) {
        let row = gridArray[i];
        let rainLeft = amount;
        for (let j = 0; j < row.length; j++) {
            const square = row[j];
            rainLeft = applyRain(square, rainLeft);
        }
    }
}

function sendRainS(amount, takeWater) {
    for (let i = 0; i < gridArray.length; i++) {
        let row = gridArray[i];
        let rainLeft = amount;
        for (let j = 0; j < row.length; j++) {
            const square = row[j];
            rainLeft = applyRain(square, rainLeft);
        }
    }
}

export function applyYearsRain(times = 1, gridArray, takeWater = true) {
    for (let i = 0; i < times; i++) {
        for (let seasonIndex = 0; seasonIndex < 4; seasonIndex++) {
            let season = world.seasons[seasonIndex];
            applySeasonsRain(season, gridArray, takeWater);
        }
    }

    assignColors(linearArray);

    return gridArray;
}

export function applySeasonsRain(season, gridArray, takeWater) {

        const windDirection = season.windDirection;

        if (windDirection === "e") {
            sendRainE(season.rainAmount, gridArray, takeWater);
        } else if (windDirection === "w") {
            sendRainE(season.rainAmount, gridArray, takeWater);
        } else if (windDirection === "n") {
            sendRainE(season.rainAmount, gridArray, takeWater);
        } else if (windDirection === "s") {
            sendRainE(season.rainAmount, gridArray, takeWater);
        }
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

export function initNewWorld() {
    // world.elevationChange = random(1, 20);
    world.globalMoisture = random(5, 20);
    world.globalTemp = random(-20,20) / 10; //-2.0 - 2.0
    world.seasons = setSeasons(world.globalMoisture, world.globalTemp);
    world.zoomLevel = 2;

    return {
        environmentGrid: [],
        organismList: [],
        planet: {},
        selectedSquare: null,
        selectedEnvironment: {
            precipitation: 40,
            avgElevation: 20,
            elevationChange: 30,
            baseTemp: 50,
            color: randomColor("green")
        },
        world: {
            worldColorsGrid,
            seasons: setSeasons()
        },
        numSeasons: 0,
        worldColorsGrid,
        grid: getInitialGrid(120, 120)
    }
}
