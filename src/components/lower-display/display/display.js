import React, {Component} from "react";
// import "./display.css";

class Display extends Component{

    render() {
        const square = this.props.selectedSquare || {groundColor: {}}
        let elevationColor = square.avgElevation > 30 ? "white" : "black";
        
        return (
            <div className="displayWrapper">
                <div className="displaySquare" style={{background: square.gridColorStyle}}>
                </div>

                <div className="displayInfo">
                    <h5>Sqaure Details</h5>
                    <div className="displayStat elevationStat" style={{background: square.elevationStyle, color: elevationColor}}>
                        Elevation: <em>{square.avgElevation}</em>
                    </div>

                    <div className="displayStat precipStat" style={{background: square.rainfallStyle}}>
                        Precipitation: <em>{square.avgPrecip}</em>
                    </div>

                    <div className="displayStat precipStat" style={{background: square.rainfallStyle}}>
                        PrecipArray: <em>{square.avgPrecipArray && square.avgPrecipArray.map((avg, index) => (<span key={index}>{avg} | </span>))}</em>
                    </div>

                    <div className="displayStat tempStat" style={{background: square.temperatureStyle}}>
                        Temperature: <em>{square.avgTemp}</em>
                    </div>

                    <div className="displayStat precipStat" style={{background: square.temperatureStyle}}>
                        TempArray: <em>{square.avgTempArray && square.avgTempArray.map((avg, index) => (<span key={index}>{avg} | </span>))}</em>
                    </div>

                </div>
            </div>
        )
    }
}

export default Display;
