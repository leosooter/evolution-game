import React, {Component} from "react";
import "./controls.css";

class Controls extends Component {
    render() {
        return (
            <div className="controlsWrapper">
                <div className="controlColumn">
                    <button className="controlButton" onClick={this.props.evolveOrganisms}>
                        Evolve Organisms
                    </button>

                    <button className="controlButton" onClick={this.props.reapplyOrganisms}>
                        Reapply Organisms
                    </button>

                    <button className="controlButton" onClick={this.props.applyInitialRain}>
                        Initial Rain
                    </button>

                    <button className="controlButton" onClick={this.props.applyYearlyRain}>
                        Yearly Rain
                    </button>

                    <button className="controlButton" onClick={this.props.applySeasonsRain}>
                        Season's Rain
                    </button>
                </div>

                <div className="controlColumn">
                    <button className="controlButton" onClick={this.props.advanceSeason}>
                        Advance Season
                    </button>

                    <button className="controlButton" onClick={this.props.increaseMoisture}>
                        Increase Moisture
                    </button>

                    <button className="controlButton" onClick={this.props.decreaseMoisture}>
                        Decrease Moisture
                    </button>

                    <button className="controlButton" onClick={this.props.toggleZoom}>
                        Toggle Zoom
                    </button>
                </div>

            </div>
        )
    }
}

export default Controls;
