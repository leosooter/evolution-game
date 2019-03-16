import {random as lodashRandom, round} from "lodash";

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


function matchRangeToRange(targetRange, valueRange, value) {
    if (value === 0) {
        return 0
    }

    const targetDiff = targetRange[1] - targetRange[0];
    const valueDiff = valueRange[1] - valueRange[0];
    const adjust = valueDiff / targetDiff;

    return round((value / adjust), 2);
}
