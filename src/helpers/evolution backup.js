function disperseFromPoint(start, maxDistance, times, callBack) {
    const {heightIndex, widthIndex} = start;

    for (let count = 0; count < times; count++) {
        const randWidth = random(widthIndex - maxDistance, widthIndex + maxDistance);
        const randHeight = random(heightIndex - maxDistance, heightIndex + maxDistance);
        const squareId = world.globalGrid[randHeight] && world.globalGrid[randHeight][randWidth];

        if (squareId) {
            const square = world.squaresObj[squareId];

            if (square) {
                callBack(square);
            }
        }
    }
}


function testMutationAgainstSquares(plant, squares) {
    for (let index = 0; index < squares.length; index++) {
        // plantCompetitionRuns ++;
        let square = world.squaresObj[squares[index]];
        // console.log('testing plant', plant.id, 'in square', square.id, 'against ownSquare', square.id);

        testPlantAgainstSquare(square, plant);
        disperseFromPoint(square, 20, 20, (testSquare) => {
            testPlantAgainstSquare(testSquare, plant);
        })

        // spreadPlantToAdjacent(plant, square, 10)

        // for (let index = 0; index < square.allSidesArray.length; index++) {
        //     const side = world.squaresObj[square.allSidesArray[index]];
        //     // console.log('testing plant', plant.id, 'in square', square.id, 'against square', side.id);
        //     testPlantAgainstSquare(side, plant);
        // }
    }
}

function mutateArray(array, power, reverse = false) {
    if (random(1, 5) === 5) {
        array.push(random(2, power))
    } else if (array.length > 1 && random(1, 5) === 5) {
        array.shift();
    }

    for (let index = array.length - 1; index > 0; index--) {
        array[index] += clamp(random(power * -1, power), 1, 50);
    }
}

function newPlantMutation(basePlant, power) {
    // let plant = totalEvolutions === 1 ? cloneDeep(testPlant2) : cloneDeep(testPlant3);
    let plant = cloneDeep(basePlant);
    plant.id = shortid.generate();
    plant.squares = [];
    plant.ancestor = basePlant.id;
    let {
        foliageProfile,
        rootProfile
    } = plant;
    mutateArray(foliageProfile, power);
    mutateArray(rootProfile, power);

    plant.foliageMass = sum(foliageProfile);
    plant.rootMass = sum(rootProfile);
    plant.totalMass = plant.foliageMass + plant.rootMass;

    applySurvivalStatsToPlant(plant);

    if (plant.height > tallestPlant.height) {
        tallestPlant = plant;
    }

    testMutationAgainstSquares(plant, basePlant.squares);
    if(plant.squares.length > 0) {
        if (plant.height > tallestSurvivingPlant.height) {
            tallestSurvivingPlant = plant;
        }
        successfulMutations ++;
        return plant;
    }

    return null;
}

export function getMutationsForPlant(plant, number = 1, power = 5) {
    // console.log('getMutationsForPlant', plant.id);

    let newPlantIds = [];
    for (let count = 0; count < number; count++) {
        let newPlant = newPlantMutation(plant, power);
        if(newPlant) {
            newPlantIds.push(newPlant.id);
            world.plantArray.push(newPlant.id);
            world.plantObj[newPlant.id] = newPlant;
        }
    }

    return newPlantIds;
}

export function evolvePlants(number, power) {
    console.log('Evolving plants', world.plantArray);
    console.log('plants', world.plantObj);

    for (let index = 0; index < world.plantArray.length; index++) {
        let plantId = world.plantArray[index];
        let plant = world.plantObj[plantId];
        plant.mutations = getMutationsForPlant(plant, number, power);
    }
    assignGridColorsToGrid();
    console.log('successfulMutations', successfulMutations);
}

export function evolveOrganisms(times) {
    totalEvolutions++;
    let t1 = performance.now();
    let mutationsPerPlant = matchInverseRangeToRange([1, 2], [0, 1000], world.plantArray.length, 0);
    console.log('mutations per plant = ', mutationsPerPlant);

    evolvePlants(mutationsPerPlant, 3);
    console.log('tallest mutation', tallestPlant.height, tallestPlant);
    console.log('tallest surviving', tallestSurvivingPlant.height, tallestSurvivingPlant);
    console.log('evolveOrganisms time:', performance.now() - t1);
    return getReturnState();
}

function extinctPlant(plant) {
    world.plantObj[plant.id].extinct = true;
    remove(world.plantArray, (targetId) => {
        return targetId === plant.id
    });
}

function cullPlants() {
    for (const key in world.plantObj) {
        let plant = world.plantObj[key];
        if (plant.squares.length <= 0) {
            extinctPlant(plant);
        }
    }
}

function addToArray(id, array) {
    const position = sortedIndexBy(array, id, (plantId) => world.plantObj[plantId] && world.plantObj[plantId].solarRatio);
    array.splice(position, 0, id);
    return array;
}

function logArrayScores(array, message) {
    console.log('..............................', message);

    for (let index = 0; index < array.length; index++) {
        const plantId = array[index];
        console.log('Index', index, "score", world.plantObj[plantId] && world.plantObj[plantId].solarRatio);
    }
}

function competePlantAgainstSquare(square, plant, niches, nicheIndex) {
    plantCompetitionRuns++;

    if (Array.isArray(niches) && plant.id && niches.indexOf(plant.id) === -1) {
        if (!world.plantObj[plant.id]) {
            world.plantObj[plant.id] = plant;
        }

        const position = sortedIndexBy(niches, plant.id, (plantId) => world.plantObj[plantId] && world.plantObj[plantId].solarRatio);

        if(position === 0 && niches.length === 5) {
            return;
        }

        niches.splice(position, 0, plant.id);
        square.totalPlants ++;
        plant.squares.push(square.id);

        if(!exampleSquare) {
            exampleSquare = square;
        }

        world.plantObj[plant.id].extinct = false;
        if(niches.length > 5) {
            square.totalPlants --;
            const removedPlant = world.plantObj[niches.shift()];
            if (removedPlant.solarRatio > world.plantObj[niches[niches.length - 1]].solarRatio) {
                console.log('ERROR __________ removing higher score plant', world.plantObj[niches[niches.length - 1]].solarRatio, removedPlant);
                for (let index = 0; index < niches.length; index++) {
                    const plantId = niches[index];
                    const plant = world.plantObj[plantId];
                    console.log('score at', index, " =", plant.solarRatio);

                }
                console.log('removed-plant solar ratio', removedPlant.solarRatio);

            }

            remove(removedPlant.squares, (targetId) => targetId === square.id);
            if(removedPlant.squares.length <= 0) {
                extinctPlant(removedPlant);
            }
            removedPlants++;
        }
    }
}

function testPlantAgainstSquare(square, plant) {
    plantsTested++;
    square.plantTested ++;
    /*
    Plant survival logic:
    If square precip and temp stats are outside range- do not add
    If square conditions are in range add and calculate survival score

    Factors:
    Plants are not limited by maxTemp or maxPrecip. They have a minTemp and minPrecip
    Because minTemp and minPrecip both limit solarGain and solarEfficiency, plants with
    lower minTemp or minPrecip will be out-competed in more ideal environments

    minTemp(-10 - 70): determined by foliageStrength

    minPrecip(1 - 70): determined by root-spread

    maxDroughtLength(0 - 3): determined by rootDepth and rootRatio
    */
    const {plantNiches, avgMinTemp, avgPrecip, maxDroughtLength} = square;
    const {height, minTemp, minPrecip, droughtTolerance} = plant;
    const nicheIndex = matchRangeToRange([0,4], [0, 12], height, 0);
    const matchedNiche = square.plantNiches[nicheIndex];

    if(!matchedNiche) {
        square.plantRejectedForNiche ++;

        if (square.plantRejectedForNicheArray.length === 0) {
            square.plantRejectedForNicheArray.push(plantNiches.length)
        }
        square.plantRejectedForNicheArray.push(height * 2);
        // if (plant.id === 1000) {
        //     console.log('^^^ rejecting TEST_PLANT on drought maxDroughtLength > droughtTolerance', maxDroughtLength, droughtTolerance);
        // }
        rejectedOnNiche++;
        // console.log('Rejecting plant on drought (plant / square)', droughtTolerance, maxDroughtLength);
        return;
    }

    if (maxDroughtLength > droughtTolerance) {
        square.plantRejectedForDrought++;
        if (square.plantRejectedForDroughtArray.length === 0) {
            square.plantRejectedForDroughtArray.push(maxDroughtLength)
        }
        square.plantRejectedForDroughtArray.push(droughtTolerance);
        // if (plant.id === 1000) {
        //     console.log('^^^ rejecting TEST_PLANT on drought maxDroughtLength > droughtTolerance', maxDroughtLength, droughtTolerance);
        // }
        rejectedOnDrought++;
        // console.log('Rejecting plant on drought (plant / square)', droughtTolerance, maxDroughtLength);
        return;
    }

    if (avgPrecip < minPrecip) {
        square.plantRejectedForPrecip++;
        if (square.plantRejectedForPrecipArray.length === 0) {
            square.plantRejectedForPrecipArray.push(avgPrecip)
        }
        square.plantRejectedForPrecipArray.push(minPrecip);
        // if (plant.id === 1000) {
        //     console.log('^^^ rejecting TEST_PLANT on precip avgPrecip < minPrecip', avgPrecip, minPrecip);
        // }
        rejectedOnPrecip++;
        // console.log('Rejecting plant on precip (plant / square)', minPrecip, avgMinPrecip);
        return;
    }

    if (avgMinTemp < minTemp) {
        square.plantRejectedForTemp ++;
        if (square.plantRejectedForTempArray.length === 0) {
            square.plantRejectedForTempArray.push(avgMinTemp)
        }
        square.plantRejectedForTempArray.push(minTemp);
        // if(plant.id === 1000) {
        //     console.log('^^^ rejecting TEST_PLANT on temp avgMinTemp < minTemp', avgMinTemp, minTemp);
        // }
        // console.log('Rejecting plant on temp (plant / square)', minTemp, avgMinTemp);
        rejectedOnTemp ++;
        return;
    }

    competePlantAgainstSquare(square, plant, matchedNiche, height - 1);
}

function assignPlantsToSquare(square) {
    if (square.avgElevation <= world.waterLevel) {
        return;
    }

    for (let index = 0; index < world.plantArray.length; index++) {
        const plant = world.plantObj[world.plantArray[index]];
        testPlantAgainstSquare(square, plant);
    }
}

function assignPlantNichesToSquare(square) {
    // tempScore = -2 - 10
    // precipScore = 0 - 20
    // nicheScore = 0 - 30

    // niches = 0 - 5
    let nicheScore = clamp(round((square.avgMinTemp / 10) + square.avgPrecip, 2), 0, 30);
    let niches = matchRangeToRange([0, 5], [0, 30], nicheScore, 0) || 0;

    for (let count = 0; count < niches; count++) {
        square.plantNiches.push([]);
    }
}

function assignOrganismsToSquare(square) {
    assignPlantNichesToSquare(square);
    assignPlantsToSquare(square);
    assignGridColorToSquare(square);
}

export function assignOrganismsToGrid() {
    loopGrid(assignOrganismsToSquare);
    console.log('tallest mutation', tallestPlant);
    console.log('tallest surviving', tallestSurvivingPlant);

    return getReturnState();
}
