import React, {Component} from "react";
import "./display.css";

class Display extends Component{

    render() {
        const square = this.props.selectedSquare || {groundColor: {}}
        console.log('square', square);


        return (
            <div className="displayWrapper">
                <div className="displayInfo">
                    <h5>Sqaure Details</h5>
                    <div className="displayStat">P: <em>{square.precipitation}</em></div>
                    <div className="displayStat">E: <em>{square.avgElevation}</em></div>
                    {/* <div className="displayStat">Elevation Change: <em>{square.elevationChange}</em></div> */}
                    <div className="displayStat">T: <em>{square.baseTemp}</em></div>
                </div>

                <div className="displayInfo">
                    <div className="displayStat">
                        R: <em>{square.groundColor.r} |</em>
                        G: <em>{square.groundColor.g} |</em>
                        B: <em>{square.groundColor.b} |</em>
                    </div>
                </div>

                <div className="displaySquare" style={{background: square.gridColorStyle}}>
                    {/* {this.renderTrees()} */}
                </div>
            </div>
        )
    }
}

export default Display;
