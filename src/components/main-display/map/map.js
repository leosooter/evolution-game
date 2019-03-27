import React, {Component} from "react";
import "./map.css";
import LowerDisplay from "../../lower-display/lower-display";
import {world} from "../../../store/state";

const viewTypes = {
    elevation: "elevationStyle",
    rainfall: "rainfallStyle",
    temperature: "temperatureStyle",
    // groundColor: "groundColorStyle",
    groundColor: "biomeColor",
    gridColor: "gridColorStyle"
}

class Map extends Component {

    handleSquareSelect = (square) => {
        this.props.selectSquare(square.id);
    }

    getSquareStyle = (square) => {
        const gridHeight = this.props.grid.height;
        const gridWidth = this.props.grid.width;
        const squareSize = 500 / gridHeight;
        const viewTypeStyle = square[viewTypes[this.props.viewType]] || null;

        if (this.props.selectedSquare && square.id === this.props.selectedSquare.id) {
            return {
                ...square.cornerStyles,
                height: `${squareSize}px`,
                width: `${squareSize}px`,
                background: "red"
            }
        }

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
        const gridArray = grid.gridArray || [];
        let returnGrid = [];

        for (let i = 0; i < gridArray.length; i++) {
            let rowArray = [];

            for (let j = 0; j < grid.width; j++) {
                let square = world.squaresObj[gridArray[i][j]];

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

export default Map;
