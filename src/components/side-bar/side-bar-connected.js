import {connect} from "react-redux";
import SideBar from "./side-bar";

function mapStateToProps(state) {
    return {...state}
}

function mapDispatchToProps(dispatch) {
    return {
        applyYearlyRain: () => dispatch({type: "APPLY_YEARLY_RAIN"}),
        applyInitialRain: () => dispatch({type: "APPLY_INITIAL_RAIN"}),
        applySeasonsRain: () => dispatch({type: "APPLY_SEASONS_RAIN"}),
        advanceSeason: () => dispatch({type: "ADVANCE_SEASON"}),
        increaseMoisture: () => dispatch({type: "INCREASE_MOISTURE"}),
        decreaseMoisture: () => dispatch({type: "DECREASE_MOISTURE"}),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);
