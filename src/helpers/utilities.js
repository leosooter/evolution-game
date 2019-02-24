import {random as lodashRandom} from "lodash";

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

