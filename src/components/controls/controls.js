import React, {Component} from "react";
import "./controls.css";

class Controls extends Component {
    render() {
        return (
            <div className="controlsWrapper">
                <button className="controlButton" onClick={this.props.applyInitialRain}>
                    Initial Rain
                </button>

                <button className="controlButton" onClick={this.props.applyYearlyRain}>
                    Yearly Rain
                </button>

                <button className="controlButton" onClick={this.props.applySeasonsRain}>
                    Season's Rain
                </button>

                <button className="controlButton" onClick={this.props.advanceSeason}>
                    Advance Season
                </button>
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
