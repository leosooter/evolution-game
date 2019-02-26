import React, {Component} from "react";
import "./map.css";
const viewTypes = {
    elevation: "elevationStyle",
    rainfall: "rainfallStyle",
    temperature: "temperatureStyle",
    groundColor: "groundColorStyle",
    gridColor: "gridColorStyle"
}

class Map extends Component {

    handleSquareSelect = (index) => {
        this.props.selectSquare(index);
    }

    getSquareStyle = (square) => {

        const numSquares = this.props.grid.gridArray.length;
        const squareSize = 1000 / numSquares;
        const viewTypeStyle = square[viewTypes[this.props.viewType]] || null;

        return {
            height: `${squareSize}px`,
            width: `${squareSize}px`,
            background: viewTypeStyle
        }
    }

    renderGrid = () => {
        const grid = this.props.grid;
        const gridArray = grid.gridArray || [];
        let returnGrid = [];

        for (let i = 0; i < gridArray.length; i++) {
            let rowArray = [];

            for (let j = 0; j < grid.width; j++) {
                let square = gridArray[i][j];

                const squareStyle = this.getSquareStyle(square);
                rowArray.push(
                    <div
                        key={j}
                        className="gridSquare"
                        style={squareStyle}
                        onClick={this.handleSquareSelect.bind(this, square.index)}
                    ></div>
                );
            }

            returnGrid.push(<div className="gridRow" key={i}>{rowArray}</div>);
        }

        return returnGrid;
    }

    render() {

        return (
            <div className="gridWrapper" key={this.props.numSeasons}>
                {this.renderGrid()}
            </div>
        )
    }
}

export default Map;
