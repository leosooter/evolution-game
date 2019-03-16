import {connect} from "react-redux";
import MapView from "./index";

function mapStateToProps(state, ownProps) {
    return {
        ...state,
        ...ownProps
    }
}

function mapDispatchToProps(dispatch) {
    return {
        selectSquare: (index) => dispatch({type:"SELECT_SQUARE", payload: index})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MapView);
