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

const defaultState = initNewWorld();

function reducer(state=[], action) {
    console.log('Reducer action', action);

    switch (action.type) {
        case APPLY_INITIAL_RAIN:

            applyYearsRain(80, state.grid.gridArray, false);
            state.numSeasons ++;
            return {
                ...state
            }

        break;

        case APPLY_YEARLY_RAIN:
            applyYearsRain(1, state.grid.gridArray);
            state.numSeasons++;
            return {
                ...state
            }
        break;

        case SELECT_SQUARE:
            const square = state.grid.linearArray[action.payload] || {}
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
