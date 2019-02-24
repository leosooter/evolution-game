import {sample} from "lodash";
import {colorAdjust, worldColorsGrid} from "../config/colors-config";
import {random} from "./utilities";

const blankColor = {
    colorName: "blank",
    r:255,
    g:255,
    b:255
}

export const colorTracker = {
    temp: {},
    precip: {}
};

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

function getWaterColor(baseTemp) {
    let r = 1;
    let b = baseTemp + 150;
    let g = b - 50;

    return morphColor({r,g,b}, 2);
}

export function getGridColor(square) {
    const waterLevel = 0;

    const {precipitation, avgElevation, baseTemp} = square;
    if(avgElevation <= waterLevel) {
        return getWaterColor(baseTemp);
    }

    const maxIndex = worldColorsGrid.length - 1;
    const gridAdjust = 100 / worldColorsGrid.length;
    colorTracker.gridAdjust = gridAdjust;

    let precip = Math.floor((precipitation + 1) / gridAdjust);
    precip = precip > maxIndex ? maxIndex : precip;
    // console.log('Precip', precip);
    if (!colorTracker.precip[precip]) {
        colorTracker.precip[precip] = 1;
    } else {
        colorTracker.precip[precip]++;
    }

    let temp = Math.floor((baseTemp + 1) / gridAdjust);
    temp = temp > maxIndex ? maxIndex : temp;
    // console.log('Temp', temp);

    if (!colorTracker.temp[temp]) {
        colorTracker.temp[temp] = 1;
    } else {
        colorTracker.temp[temp]++;
    }


    let colorSquare = worldColorsGrid[precip][temp] || blankColor;



    // console.log('colorSquare', colorSquare);
    const {r,g,b} = colorSquare;
    return morphColor({r,g,b}, 5);
}

export function applyYearlyRain(square) {
    const waterLevel = 0;
    const {precipitation, avgElevation, baseTemp} = square;
    if(avgElevation <= waterLevel) {
        return getWaterColor(baseTemp);
    }

    let g = Math.floor(200 - (avgElevation / 3)) + colorAdjust.g;
    let r = Math.floor(g * (1.25 - ((precipitation / 100) * 1.25))) + colorAdjust.g;
    let b = Math.floor(100 - baseTemp + 1) + colorAdjust.b;

    return morphColor({r,g,b}, 3);

    //desert brown r230 g160 b75
}

export function randomColor(colorType) {

    return randomGreen();
}
