import React, {Component} from "react";

import Controls from "./upper-display/controls/basic-controls/controls";
import TerraformControls from "./upper-display/controls/terraform-controls/terraform-controls";
import WorldColors from "./lower-display/world-colors/world-colors";
import WorldInfo from "./upper-display/world-info/world-info";
import "./side-bar.css";

class SideBar extends Component{
    render() {

        return (
            <div className="sideBarWrapper">
                <Controls {...this.props} />
                <TerraformControls {...this.props} />
                <WorldInfo {...this.props.world}/>
                {/* <WorldColors worldColorsGrid={this.props.worldColorsGrid} /> */}
            </div>
        )
    }
}

export default SideBar;
