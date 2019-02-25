import { newSquare } from "../src/helpers/grid-helpers";

let elevationGrid10X10;

function mockGridBuilder(size = 10, randDefault, options) {
    const {elevationValues, tempValues, precipValues} = options;


    let grid = [];
    let index = 0;

    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            let setElevation = (elevationValues && elevationValues[i][j]) || randDefault || 0;
            let setTemp = (tempValues && tempValues[i][j]) || randDefault || 0;
            let setPrecip = (precipValues && precipValues[i][j]) || randDefault || 0;

            const squareOptions = {
                setElevation,
                setTemp,
                setPrecip
            };

            row.push(newSquare(index, 0, squareOptions))
            index ++;
        }

        grid.push(row);
    }

    return grid;
}

let elevationValues = [
    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
];

let newGrid = mockGridBuilder(10, 0, {elevationValues: elevationValues});

console.log('New Grid', newGrid);


