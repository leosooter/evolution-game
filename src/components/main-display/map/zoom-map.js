import React, {Component} from "react";
import "./map.css";
const viewTypes = {
    elevation: "elevationStyle",
    rainfall: "rainfallStyle",
    temperature: "temperatureStyle",
    groundColor: "groundColorStyle",
    gridColor: "gridColorStyle"
}

class ZoomMap extends Component {

    handleSquareSelect = (square) => {
        this.props.selectSquare(square);
    }

    getSquareStyle = (square) => {

        const gridWidth = this.props.grid.mapZoomWidth;
        const squareSize = 1100 / gridWidth;
        const viewTypeStyle = square[viewTypes[this.props.viewType]] || null;

        if(this.props.viewType === "gridColor") {
            return {
                ...square.cornerStyles,
                height: `${squareSize}px`,
                width: `${squareSize}px`,
                background: viewTypeStyle
            }
        }

        return {
            height: `${squareSize}px`,
            width: `${squareSize}px`,
            background: viewTypeStyle
        }
    }

    renderGrid = () => {
        const grid = this.props.grid;
        const zoomArray = grid.zoomArray || [];
        const {mapZoomWidth, mapZoomHeight} = grid
        let returnGrid = [];

        for (let i = 0; i < mapZoomHeight; i++) {
            let rowArray = [];

            for (let j = 0; j < mapZoomWidth; j++) {
                let square = zoomArray[i][j];

                const squareStyle = this.getSquareStyle(square);
                rowArray.push(
                    <div
                        key={j}
                        className="gridSquare"
                        style={squareStyle}
                        onClick={this.handleSquareSelect.bind(this, square)}
                    ></div>
                );
            }

            returnGrid.push(<div className="gridRow" key={i}>{rowArray}</div>);
        }

        return returnGrid;
    }

    render() {
        return (
            <div className="gridWrapper" key={this.props.totalSeasons}>
                <div className="gridBackground">
                    {this.renderGrid()}
                </div>
            </div>
        )
    }
}

export default ZoomMap;
