import {createStore} from "redux";
import {APPLY_INITIAL_RAIN, APPLY_YEARLY_RAIN, SELECT_SQUARE} from "./types";
import {random} from "../helpers/utilities";
import {initNewWorld, applyYearsRain} from "../helpers/grid-helpers";

function generateRandomEnvironment() {
    const environment = {
        precipitation: random(0,100),
        avgElevation: random(0,100),
        elevationChange: random(0,50),
        baseTemp: random(0,100),
    }

    environment.color = applyYearlyRain(environment);

    return environment;
}

// Max num squares per side 164
const defaultState = initNewWorld(100,100);

function reducer(state=[], action) {
    console.log('Reducer action', action);

    switch (action.type) {
        case APPLY_INITIAL_RAIN:

            applyYearsRain(10, false);
            state.numSeasons ++;
            return {
                ...state
            }

        break;

        case APPLY_YEARLY_RAIN:
            applyYearsRain(1, false);
            state.numSeasons++;
            return {
                ...state
            }
        break;

        case SELECT_SQUARE:
            const square = state.grid.linearArray[action.payload] || {}
            console.log('Selected Square', square);

            return {
                ...state,
                selectedSquare: square
            }
        break;

        default:
            return state
            break;
    }
}

const store = createStore(
    reducer,
    defaultState
);

export default store;
