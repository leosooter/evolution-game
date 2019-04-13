import {connect} from "react-redux";
import SideBar from "./side-bar";

function mapStateToProps(state) {
    return {...state}
}

function mapDispatchToProps(dispatch) {
    return {
        evolveOrganisms: () => dispatch({type: "EVOLVE_ORGANISMS"}),
        addAnimals: () => dispatch({type: "ADD_ALL_ANIMALS"}),
        reapplyOrganisms: () => dispatch({type: "REAPPLY_ORGANISMS"}),
        applyYearlyRain: () => dispatch({type: "APPLY_YEARLY_RAIN"}),
        applyInitialRain: () => dispatch({type: "APPLY_INITIAL_RAIN"}),
        applySeasonsRain: () => dispatch({type: "APPLY_SEASONS_RAIN"}),
        advanceSeason: () => dispatch({type: "ADVANCE_SEASON"}),
        increaseMoisture: () => dispatch({type: "INCREASE_MOISTURE"}),
        decreaseMoisture: () => dispatch({type: "DECREASE_MOISTURE"}),
        moveTime: (payload) => dispatch({type: "MOVE_TIME", payload}),
        toggleZoom: () => dispatch({type: "TOGGLE_ZOOM"}),
        changeView: (payload) => dispatch({type: "CHANGE_VIEW", payload})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);
