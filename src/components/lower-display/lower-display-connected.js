import {connect} from "react-redux";
import LowerDisplay from "./lower-display";

function mapStateToProps(state) {
    return {...state}
}

function mapDispatchToProps(dispatch) {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LowerDisplay);
