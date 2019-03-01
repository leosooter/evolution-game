import {createStore} from "redux";
import {APPLY_INITIAL_RAIN, APPLY_YEARLY_RAIN, SELECT_SQUARE, APPLY_SEASONS_RAIN, ADVANCE_SEASON} from "./types";
import {initNewWorld, applyYearsRain, applySeasonsRain, advanceSeason} from "../helpers/grid-helpers";

const worldOptions = {
    height: 80,
    width: 180,
    zoomLevel: 2,
    waterLevel: 0
}
const defaultState = initNewWorld(worldOptions);

function reducer(state, action) {
    console.log('Reducer action', action);

    switch (action.type) {
        case APPLY_INITIAL_RAIN:

            return {
                ...applyYearsRain(5, false)
            }

        break;

        case APPLY_YEARLY_RAIN:

            return {
                ...applyYearsRain(15, true)
            }
        break;

        case APPLY_SEASONS_RAIN:

            return {
                ...applySeasonsRain(15, false)
            }
        break;

        case ADVANCE_SEASON:

            return {
                ...advanceSeason()
            }
        break;

        case SELECT_SQUARE:
            const square = state.grid.gridArray[action.payload.heightIndex][action.payload.widthIndex] || {}
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
