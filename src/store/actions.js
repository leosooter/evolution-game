import {APPLY_INITIAL_RAIN, SELECT_SQUARE} from "./types";
import {APPLY_YEARLY_RAIN} from "./types";
import {GENERATE_GROUND_COLOR} from "./types";

export function applyInitialRain() {
    return {type: APPLY_INITIAL_RAIN};
}

export function applyYearlyRain() {
    return {
        type: APPLY_YEARLY_RAIN
    };
}

// export function applyYearlyRain() {
//     return {
//         type: GENERATE_GROUND_COLOR
//     };
// }

export function selectSquare(index) {
    return {
        type: SELECT_SQUARE,
        payload: index
    };
}

