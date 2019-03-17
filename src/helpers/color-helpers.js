import {sample, clamp} from "lodash";
import {colorAdjust, worldColorsGrid, riverArray, fallArray} from "../config/colors-config";
import {random, matchInverseRangeToRange, matchRangeToRange} from "./utilities";

const blankColor = {
    colorName: "blank",
    r:25,
    g:25,
    b:25
}

export function randomBrown(min, max) {
    const r = random(44, 255);
    const g = Math.floor(r * random(.5, .75));
    const b = Math.floor(r * random(0, .2));

    return {
        r,
        g,
        b
    }
}

export function randomGreen(min, max) {
    const g = random(44, 255);
    const r = Math.floor(g * random(.25, .8));
    const b = Math.floor(g * random(.25, .6));

    return {
        r,
        g,
        b
    }
}

function morphHue(hue, power) {
    let modifier = power - random(0, (power * 2));

    return hue + modifier;
}

export function morphColor(color, power = 3) {
    let {r,g,b} = color;
    if(!r || !g || !b) {
        return color;
    }

    r = morphHue(r, power);
    g = morphHue(g, power);
    b = morphHue(b, power);

    return {
        r,
        g,
        b
    }
}

function getWaterColor(baseTemp, avgElevation) {
    let r;
    let g;
    let b;
    if (baseTemp <= 10 && avgElevation >= -10 && random(0, baseTemp) <= 8) {
        r = 235; // Ice color
        b = 255;
        g = 245;
    } else {
        r = 1;
        b = baseTemp + 150;
        g = b - 50;
    }

    return morphColor({r,g,b}, 2);
}

function getRiverColor(temp) {
    const arrayAdjust = 100 / riverArray.length;

    let tempIndex = clamp(Math.round((temp + 1) / arrayAdjust), 0, riverArray.length - 1);
    return riverArray[tempIndex];
}

function getFallColor(temp) {
    const arrayAdjust = 100 / fallArray.length;

    let tempIndex = clamp(Math.round((temp + 1) / arrayAdjust), 0, fallArray.length - 1);

    return fallArray[tempIndex];
}

function getSnowColor() {
    let r = 255;
        let g = 255;
        let b = 255;

        return morphColor({r,g,b}, 5);
}

function getMountainColor() {
    let r = 125;
        let g = 125;
        let b = 135;

        return morphColor({r,g,b}, 5);
}

export function getGridColor(square, waterLevel = 0, season) {
    const {
        precipitation,
        plants,
        avgElevation,
        baseTemp
    } = square;

    if (avgElevation <= waterLevel) {
        return getWaterColor(baseTemp, square.avgElevation);
    }

    if ((baseTemp <= 15 && precipitation > 5 && random(0, baseTemp) <= 10)) {
        return getSnowColor();
    }

    // if (avgElevation >= 80) {
    //     return getMountainColor();
    // }

    if (precipitation > 100) {
        return getRiverColor(baseTemp)
    }

    if (plants.length > 3 && season === "Fall") {
        return getFallColor(baseTemp);
    }

    const plantsIndex = matchRangeToRange([0, worldColorsGrid.length - 1], [0,10], plants.length, 0);
    const maxIndex = worldColorsGrid.length - 1;
    const gridAdjust = 100 / worldColorsGrid.length;

    let temp = Math.floor((baseTemp + 1) / gridAdjust);
    temp = temp > maxIndex ? maxIndex : temp;

    let colorSquare = worldColorsGrid[plantsIndex][temp] || blankColor;

    const {
        r,
        g,
        b
    } = colorSquare;
    return morphColor({
        r,
        g,
        b
    }, 5);
}

// export function getGridColor(square, waterLevel = 0, season) {
//     const {precipitation, avgElevation, baseTemp} = square;

//     if (avgElevation <= waterLevel) {
//         return getWaterColor(baseTemp, square.avgElevation);
//     }

//     if ((baseTemp <= 15 && precipitation > 5 && random(0, baseTemp) <= 10)) {
//         return getSnowColor();
//     }

//     if(avgElevation >= 80) {
//         return getMountainColor();
//     }

//     if(precipitation > 100) {
//         return getRiverColor(baseTemp)
//     }

//     if(precipitation > 80 && season === "Fall") {
//         return getFallColor(baseTemp);
//     }

//     // if(square.precipitation > 100) {
//     //     return {r: 255, g: 0, b: 0}
//     // }
//     // else if (square.precipitation === 100) {
//     //     return {r: 255, g: 100, b: 100}
//     // }

//     const maxIndex = worldColorsGrid.length - 1;
//     const gridAdjust = 100 / worldColorsGrid.length;
//     colorTracker.gridAdjust = gridAdjust;

//     let precip = Math.floor((precipitation + 1) / gridAdjust);
//     precip = precip > maxIndex ? maxIndex : precip;
//     if (!colorTracker.precip[precip]) {
//         colorTracker.precip[precip] = 1;
//     } else {
//         colorTracker.precip[precip]++;
//     }

//     let temp = Math.floor((baseTemp + 1) / gridAdjust);
//     temp = temp > maxIndex ? maxIndex : temp;

//     if (!colorTracker.temp[temp]) {
//         colorTracker.temp[temp] = 1;
//     } else {
//         colorTracker.temp[temp]++;
//     }

//     let colorSquare = worldColorsGrid[precip][temp] || blankColor;

//     const {r,g,b} = colorSquare;
//     return morphColor({r,g,b}, 5);
// }

// export function applyYearlyRain(square) {
//     const waterLevel = 0;
//     const {precipitation, avgElevation, baseTemp} = square;
//     if(avgElevation <= waterLevel) {
//         return getWaterColor(baseTemp);
//     }

//     let g = Math.floor(200 - (avgElevation / 3)) + colorAdjust.g;
//     let r = Math.floor(g * (1.25 - ((precipitation / 100) * 1.25))) + colorAdjust.g;
//     let b = Math.floor(100 - baseTemp + 1) + colorAdjust.b;

//     return morphColor({r,g,b}, 3);

//     //desert brown r230 g160 b75
// }

export function randomColor(colorType) {

    return randomGreen();
}
