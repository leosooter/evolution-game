import React, {Component} from "react";

import Controls from "../controls/controls";
import Display from "../display/display";
import WorldColors from "../world-colors/world-colors";
import "./side-bar.css";

class SideBar extends Component{

    render() {
        return (
            <div className="sideBarWrapper">
                <Controls {...this.props} />
                <Display selectedSquare={this.props.selectedSquare} />
                <WorldColors worldColorsGrid={this.props.worldColorsGrid} />
            </div>
        )
    }
}

export default SideBar;
