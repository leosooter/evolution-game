import {connect} from "react-redux";
import Environment from "./environment";

function mapStateToProps(state) {
    const selectedEnvironment = state.selectedEnvironment;

    return {
        ...selectedEnvironment
    }
}

function mapDispatchToProps(dispatch) {
    return {
        applyInitialRain: () => dispatch({type:"APPLY_INITIAL_RAIN"}),
        generateNewColor: (color) => dispatch({type:"APPLY_YEARLY_RAIN", payload: color})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Environment);

