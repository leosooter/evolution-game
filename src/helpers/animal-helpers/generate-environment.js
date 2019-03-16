import {sample, random} from "lodash";

function generateNewColor () {
    return sample(["red", "blue", "green", "yellow", "tan", "orange"]);
}

function generateEnvironment() {

    let numColors = random(1, 5);
    let variations = random(numColors, numColors * 5);
    let colors = [];
    let swatches = [];

    for (let index = 0; index < numColors; index++) {
        colors.push(generateNewColor());
    }

    for (let index = 0; index < variations; index++) {
        swatches.push(sample(colors))
    }

    return {
        colors,
        swatches
    }
}

export default generateEnvironment;
