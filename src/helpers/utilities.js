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
