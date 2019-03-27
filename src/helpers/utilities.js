import {random as lodashRandom, clamp, round} from "lodash";

export function random(min, max) {
    if (min >= 0) {
        return lodashRandom(min, max);
    }

    let maxRand = lodashRandom(0, max);
    let minRand = lodashRandom(0, Math.abs(min)) * -1;
    if (minRand === -0) {
        minRand = 0;
    }

    return lodashRandom(1,2) === 2 ? minRand : maxRand;
}


export function matchRangeToRange(targetRange, valueRange, value, roundTo = 0) {
    if (value === 0) {
        return 0
    }

    const targetDiff = targetRange[1] - targetRange[0];
    const valueDiff = valueRange[1] - valueRange[0];
    const adjust = valueDiff / targetDiff;

    return clamp(round((value / adjust), roundTo), targetRange[0], targetRange[1]);
}

export function matchInverseRangeToRange(targetRange, valueRange, value, roundTo = 0) {
    if (value === 0) {
        return 0
    }

    const targetDiff = targetRange[1] - targetRange[0];
    const valueDiff = valueRange[1] - valueRange[0];
    const adjust = valueDiff / targetDiff;

    return clamp(round(targetRange[1] - (value / adjust), roundTo), targetRange[0], targetRange[1]);
}

export function fractionArray(array, fraction) {
    if(fraction > array.length) {
        console.warn("*** Array fraction must be smaller than array length (at fractionArray)")
        return array;
    }
    const returnArray = [];
    const fractionLength = Math.floor(array.length / fraction);
    let index = 0;

    for (let i = 0; i < fraction; i++) {
        const section = []
        for (let j = 0; j < fractionLength; j++) {
            if(array[index]) {
                section.push(array[index])
            }
            index ++;
        }

        if(i === fraction - 1 && array[index]) {
            section.push(array[index])
        }
        if(section[0]) {
            returnArray.push(section);
        }
    }

    return returnArray;
}
