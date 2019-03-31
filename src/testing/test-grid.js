import React, {Component} from "react";
import "./test-grid.css";

function loopGrid(callBack, outerCallBack) {
    if (!typeof callback === "function") {
        console.warn("callback must be a function --- in loopGrid()");
    }

    let gridHeight = testGrid.length;
    let gridWidth = testGrid[0].length;

    for (let heightIndex = 0; heightIndex < gridHeight; heightIndex++) {
        outerCallBack && outerCallBack(testGrid[heightIndex]);
        for (let widthIndex = 0; widthIndex < gridWidth; widthIndex++) {
            const squareId = testGrid[heightIndex][widthIndex];
            // console.log('squareId', squareId);

            const square = squaresObj[squareId];
            callBack(square);
        }
    }
}

export function assignSidesToSquare(square) {
    const {
        widthIndex,
        heightIndex
    } = square
    const row = testGrid[heightIndex];

    if (widthIndex > 0) {
        let wSquare = squaresObj[row[widthIndex - 1]]
        square.w = wSquare.id;
        square.allSidesArray.push(wSquare.id);
        square.mainSidesArray.push(wSquare.id);

        wSquare.e = square.id;
        wSquare.allSidesArray.push(square.id);
        wSquare.mainSidesArray.push(square.id);

        if (heightIndex > 0) {
            let nwSquare = squaresObj[testGrid[heightIndex - 1][widthIndex - 1]];
            square.nw = nwSquare.id;
            square.allSidesArray.push(nwSquare.id);

            nwSquare.se = square.id;
            nwSquare.allSidesArray.push(square.id);
        }
    }

    if (heightIndex > 0) {
        let nSquare = squaresObj[testGrid[heightIndex - 1][widthIndex]]
        square.n = nSquare.id;
        square.allSidesArray.push(nSquare.id);
        square.mainSidesArray.push(nSquare.id);

        nSquare.s = square.id;
        nSquare.allSidesArray.push(square.id);
        nSquare.mainSidesArray.push(square.id);

        if (widthIndex < heightIndex - 1) {
            let neSquare = squaresObj[testGrid[heightIndex - 1][widthIndex + 1]];
            square.ne = neSquare.id;
            square.allSidesArray.push(neSquare.id);

            neSquare.sw = square.id;
            neSquare.allSidesArray.push(square.id);
        }
    }
}

export function assignSidesToGrid() {
    loopGrid(assignSidesToSquare);
}


let square1 = {
    id: "1",
    avgElevation: 10,
    widthIndex:0,
    heightIndex: 0,
    allSidesArray:[],
    mainSidesArray: []
}

let square2 = {
    id: "2",
    avgElevation: 20,
    widthIndex:1,
    heightIndex: 0,
    allSidesArray:[],
    mainSidesArray: []
}

let square3 = {
    id: "3",
    avgElevation: 30,
    widthIndex:2,
    heightIndex: 0,
    allSidesArray:[],
    mainSidesArray: []
}

let square4 = {
    id: "4",
    avgElevation: 40,
    widthIndex:0,
    heightIndex: 1,
    allSidesArray:[],
    mainSidesArray: []
}

let square5 = {
    id: "5",
    avgElevation: 50,
    widthIndex:1,
    heightIndex: 1,
    allSidesArray:[],
    mainSidesArray: []
}

let square6 = {
    id: "6",
    avgElevation: 60,
    widthIndex:2,
    heightIndex: 1,
    allSidesArray:[],
    mainSidesArray: []
}

let square7 = {
    id: "7",
    avgElevation: 70,
    widthIndex:0,
    heightIndex: 2,
    allSidesArray:[],
    mainSidesArray: []
}

let square8 = {
    id: "8",
    avgElevation: 80,
    widthIndex:1,
    heightIndex: 2,
    allSidesArray:[],
    mainSidesArray: []
}

let square9 = {
    id: "9",
    avgElevation: 90,
    widthIndex:2,
    heightIndex: 2,
    allSidesArray:[],
    mainSidesArray: []
}

let testGrid = [
    [square1.id, square2.id, square3.id],
    [square4.id, square5.id, square6.id],
    [square7.id, square8.id, square9.id]
]

let squaresObj = {
    "1": square1,
    "2": square2,
    "3": square3,
    "4": square4,
    "5": square5,
    "6": square6,
    "7": square7,
    "8": square8,
    "9": square9
}

function getSquare(id) {
    return squaresObj[id];
}


assignSidesToGrid();

// console.log('testGrid', testGrid);


class TestGrid extends Component {

    getSquareStyle = (square) => {
        let r = 100 - square.avgElevation;
        let g = r;
        let b = r;
        let elevationStyle = `rgb(${r}, ${g}, ${b})`;
        return {background: elevationStyle};
    }

    renderDetailGrid = (gridSquare, detail) => {
        let midPoint = Math.floor(detail / 2);
        let closestSide = null;
        let sideProximity = 0;

        for (let heightIndex = 0; heightIndex < detail; heightIndex++) {
            const gridRow = [];
            for (let widthIndex = 0; widthIndex < detail; widthIndex++) {
                if(heightIndex < midPoint) {
                    if(widthIndex < midPoint && gridSquare) {

                    }
                }
            }
        }
    }

    renderMainGrid = (grid, detail) => {
        let renderGrid = [];
        for (let heightIndex = 0; heightIndex < grid.length; heightIndex++) {
            const renderRow = [];
            for (let widthIndex = 0; widthIndex < grid[heightIndex].length; widthIndex++) {
                const squareId = grid[heightIndex][widthIndex];
                const square = getSquare(squareId);
                const squareStyle = this.getSquareStyle(square);
                renderRow.push(<div className="gridSquare" style={squareStyle}>{this.renderDetailGrid(square)}</div>)
            }
            renderGrid.push(<div className="gridRow">{renderRow}</div>);
        }

        return renderGrid;
    }

    render() {
        return (
            <div className="gridWrapper">
                {this.renderMainGrid(testGrid, 1)}
            </div>
        )
    }
}

export default TestGrid;
