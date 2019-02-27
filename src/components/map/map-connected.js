import {connect} from "react-redux";
import Map from "./map";

function mapStateToProps(state, ownProps) {
    console.log('Map, mapState', state);

    return {
        view: ownProps.viewType,
        grid: state.grid,
        totalSeasons: state.totalSeasons
    }
}

function mapDispatchToProps(dispatch) {
    return {
        selectSquare: (index) => dispatch({type:"SELECT_SQUARE", payload: index})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);
