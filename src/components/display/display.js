import React, {Component} from "react";
import "./display.css";

class Display extends Component{

    render() {
        console.log('Display props', this.props);

        const square = this.props.selectedSquare || {groundColor: {}}
        console.log('Selected square', square);
        let elevationColor = square.avgElevation > 30 ? "white" : "black";


        return (
            <div className="displayWrapper">
                <div className="displaySquare" style={{background: square.gridColorStyle}}>
                </div>

                <div className="displayInfo">
                    <h5>Sqaure Details</h5>

                    <div className="displayStat precipStat" style={{background: square.rainfallStyle}}>
                        Precipitation: <em>{square.precipitation}</em>
                    </div>

                    <div className="displayStat elevationStat" style={{background: square.elevationStyle, color: elevationColor}}>
                        Elevation: <em>{square.avgElevation}</em>
                    </div>

                    <div className="displayStat tempStat" style={{background: square.temperatureStyle}}>
                        Temperature: <em>{square.baseTemp}</em>
                    </div>

                </div>
            </div>
        )
    }
}

export default Display;
