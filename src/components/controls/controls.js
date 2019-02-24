import React, {Component} from "react";
import "./controls.css";

class Controls extends Component {
    constructor(props) {
        super(props)

        this.state = {

        }
    }


    render() {
        return (
            <div className="controlsWrapper">
                <button className="controlButton" onClick={this.props.applyInitialRain}>
                    Initial Rain
                </button>

                <button className="controlButton" onClick={this.props.applyYearlyRain}>
                    Yearly Rain
                </button>

                {/* <button className="controlButton" onClick={this.handleShrubColor}>
                    Generate New Shrub Color
                </button>

                <button className="controlButton" onClick={this.handleTreeColor}>
                    Generate New Tree Color
                </button>

                <button className="controlButton" onClick={this.handleWaterColor}>
                    Generate New Water Color
                </button> */}
            </div>
        )
    }
}

export default Controls;


/*
<button onClick={this.props.generateNewColor.bind(this, "brown")}>Brown</button>
                    <button onClick={this.props.generateNewColor.bind(this, "green")}>Green</button>
                    <button onClick={this.props.generateNewColor.bind(this, "blue")}>Blue</button>
                    */
