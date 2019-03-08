import React from "react";

let globalGrid = [];

function newSquare(index, widthIndex, heightIndex, options={}) { // options param is used to generate set-value squares for mocks
    const {setElevation, setTemp, setPrecip} = options;

    let square = {
        avgElevation: setElevation || null,
        waterElevation: 0,
        precipitation: setPrecip || 0,
        baseTemp: setTemp || 0,
        index,
        latitude : null,
        widthIndex,
        heightIndex,
        allSidesArray: [],
        mainSidesArray: [],
        cornerStyles: {},
        n: null,
        s: null,
        e: null,
        w: null,
        nw: null,
        ne: null,
        sw: null,
        se: null
    }

    return square;
}

function setRandomGlobalGrid(height, width) {
    let t0 = performance.now();
    let index = 0;

    for (let gridHeight = 0; gridHeight < height; gridHeight++) {
        const row = [];

        for (let gridWidth = 0; gridWidth < width; gridWidth++) {
            row.push(newSquare(index, gridWidth, gridHeight));
            index ++;
        }

        globalGrid.push(row);
    }
    let t1 = performance.now();

    console.log('setRandomGlobalGrid time', t1 - t0);
}
const testResults = {
    basic: 0,
    improved: 0,
    mapping: 0
}


setRandomGlobalGrid(2, 2);

function busyWork(square) {
    for (const key in square) {
        if (square.hasOwnProperty(key)) {
            square[key] = "test";
        }
    }
    console.log('Done');
}

function basicForLoop() {
    let t1 = performance.now();
    for (let index = 0; index < globalGrid.length; index++) {
        busyWork(globalGrid[index]);
    }
    let t2 = performance.now();
    testResults.basic = t2 - t1;
}

function improvedForLoop() {
    let t1 = performance.now();
    let index = 0;
    let length = globalGrid.length;

    for (index; index < length; index++) {
        busyWork(globalGrid[index]);
    }
    let t2 = performance.now();
    testResults.improved = t2 - t1;
}

function mappingLoop() {
    let t1 = performance.now();
    globalGrid.map(busyWork);
    let t2 = performance.now();
    testResults.mapping = t2 - t1;
}

mappingLoop();
basicForLoop();
improvedForLoop();


export default function() {
    return (
    <div>
        <div>Test</div>
        <div>Basic {testResults.basic}</div>
        <div>Improved {testResults.improved}</div>
        <div>Mapping {testResults.mapping}</div>
    </div>
    );
}


