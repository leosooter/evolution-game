import {createStore} from "redux";
import {APPLY_INITIAL_RAIN, APPLY_YEARLY_RAIN, SELECT_SQUARE, APPLY_SEASONS_RAIN, ADVANCE_SEASON, INCREASE_MOISTURE, DECREASE_MOISTURE, MOVE_TIME, TOGGLE_ZOOM, EVOLVE_ORGANISMS} from "./types";
import {
  initNewWorld, 
  applyYearsRain, 
  applySeasonsRain, 
  advanceSeason, 
  increaseMoisture, 
  decreaseMoisture, 
  moveTime, 
  toggleZoom, 
  evolveOrganisms, 
  assignOrganismsToGrid,
  assignAnimalsToGrid, 
  assignAnimalToGrid
} from "../helpers/grid-helpers";
import {world} from "../store/state";

const worldOptions = {
    height: 80,
    width: 160,
    // height: 10,
    // width: 20,
    zoomLevel: 2,
    waterLevel: 0
}
const defaultState = {
    ...initNewWorld(worldOptions),
    viewType: "gridColor"
};
// const defaultState = {};

function reducer(state, action) {
    switch (action.type) {
        case EVOLVE_ORGANISMS:
            
            return {
                ...evolveOrganisms(10, 5),
                viewType: state.viewType
            }

        break;

        case "REAPPLY_ORGANISMS":

            return {
                ...assignOrganismsToGrid(1)
            }

        break;

        case "CHANGE_VIEW":

            return {
                ...state,
                viewType: action.payload.view
            }

        break;

        case "ADD_ALL_ANIMALS":
            console.log("ADD_ALL_ANIMALS");
            
            return {
                ...assignAnimalsToGrid(),
                viewType: state.viewType
            }

        break;

        case "ADD_ANIMAL":

            return {
                ...assignAnimalToGrid(action.payload.animal),
                viewType: state.viewType
            }

        break;

        case APPLY_INITIAL_RAIN:

            return {
                ...applyYearsRain(5, false),
                viewType: state.viewType
            }

        break;

        case APPLY_YEARLY_RAIN:

            return {
                ...applyYearsRain(1, true),
                viewType: state.viewType
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

        case INCREASE_MOISTURE:

            return {
                ...increaseMoisture()
            }
        break;

        case DECREASE_MOISTURE:

            return {
                ...decreaseMoisture()
            }
        break;

        case MOVE_TIME:

            return {
                ...moveTime(action.payload)
            }
        break;

        case SELECT_SQUARE:
            const square = world.squaresObj[action.payload] || {}
            console.log('Selected Square', square);

            return {
                ...state,
                selectedSquare: square,
                viewType: state.viewType
            }
        break;

        case TOGGLE_ZOOM:
            return {
                ...toggleZoom(state.selectedSquare)
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
