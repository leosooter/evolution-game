import React, {Component} from "react";

import Controls from "../controls/basic-controls/controls";
import TerraformControls from "../controls/terraform-controls/terraform-controls";
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
                <TerraformControls {...this.props} />
                <WorldInfo {...this.props.world}/>
                <Display {...this.props} />
                <WorldColors worldColorsGrid={this.props.worldColorsGrid} />
            </div>
        )
    }
}

export default SideBar;
