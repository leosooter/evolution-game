import React, {Component} from "react";

import Controls from "../controls/controls";
import Display from "../display/display";
import WorldColors from "../world-colors/world-colors";
import WorldInfo from "../world-info/world-info";
import "./side-bar.css";

class SideBar extends Component{
    render() {
        console.log('Side Bar Props', this.props);

        return (
            <div className="sideBarWrapper">
                <Controls {...this.props} />
                <WorldInfo {...this.props.world}/>
                <Display selectedSquare={this.props.selectedSquare} />
                <WorldColors worldColorsGrid={this.props.worldColorsGrid} />
            </div>
        )
    }
}

export default SideBar;
