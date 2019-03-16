import React, {Component} from "react";
import Display from "./display/display";
import SquareLifeforms from "./square-lifeforms/square-lifeforms";
import "./lower-display.css";


class LowerDisplay extends Component {
    render() {
        return (
            <div className="lowerDisplay">
                <Display {...this.props}/>
                <SquareLifeforms {...this.props}/>
            </div>
        )
    }
}

export default LowerDisplay;
