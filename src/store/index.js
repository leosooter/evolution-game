import {createStore} from "redux";
import {APPLY_INITIAL_RAIN, APPLY_YEARLY_RAIN, SELECT_SQUARE} from "./types";
import {random} from "../helpers/utilities";
import {initNewWorld, applyYearsRain} from "../helpers/grid-helpers";

const worldOptions = {
    height: 110,
    width: 160,
    zoomLevel: 5,
    waterLevel: 0
}
const defaultState = initNewWorld(worldOptions);

function reducer(state, action) {
    console.log('Reducer action', action);

    switch (action.type) {
        case APPLY_INITIAL_RAIN:

            applyYearsRain(10, false);

            state.totalSeasons ++;
            return {
                ...state
            }

        break;

        case APPLY_YEARLY_RAIN:
            applyYearsRain(1, false);

            state.totalSeasons++;
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
