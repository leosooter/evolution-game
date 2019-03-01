import {APPLY_INITIAL_RAIN, SELECT_SQUARE, APPLY_SEASONS_RAIN, APPLY_YEARLY_RAIN, ADVANCE_SEASON} from "./types";

export function applyInitialRain() {
    return {type: APPLY_INITIAL_RAIN};
}

export function applyYearlyRain() {
    return {
        type: APPLY_YEARLY_RAIN
    };
}

export function applySeasonsRain() {
    return {
        type: APPLY_SEASONS_RAIN
    };
}

export function advanceSeason() {
    return {
        type: ADVANCE_SEASON
    };
}

export function selectSquare(index) {
    return {
        type: SELECT_SQUARE,
        payload: index
    };
}

