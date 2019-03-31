import {sample, clamp, round, cloneDeep, sum} from "lodash";
import shortid from "shortid";
import {random, matchInverseRangeToRange, matchRangeToRange, fractionArray} from "../utilities";
import {world, globalGrid, globalZoomArray, plants} from "../../store/state";
import {testPlantAgainstDiffArray} from "../grid-helpers";

let maxPlant = {solarRatio: 0, name:"NONE"};

export const testPlant1 = {
    depth: 1,
    droughtTolerance: 4,
    foliageMass: 104,
    foliageProfile: [1,2,3,4,5,6,7,8,9,10,11],
    foliageRatio: 0.7878787878787878,
    foliageStrength: 0.08,
    height: 4,
    id: "1-1-1-1-1-1-1-1",
    minPrecip: 0,
    minTemp: 40,
    name: "___ Test Plant 1___",
    rootMass: 28,
    rootProfile: [27],
    rootRatio: 0.21212121212121213,
    biomes: [],
    solarRatio: .5,
    totalMass: 132,
    extinct: true
}

export const testPlant2 = {
    depth: 1,
    droughtTolerance: 4,
    foliageMass: 104,
    foliageProfile: [21, 77, 1, 3],
    foliageRatio: 0.7878787878787878,
    foliageStrength: 0.08,
    height: 4,
    id: "2-2-2-2-2-2-2-2-2",
    minPrecip: 0,
    minTemp: 10,
    name: "___ Test Plant 2___",
    rootMass: 28,
    rootProfile: [27],
    rootRatio: 0.21212121212121213,
    biomes: [],
    solarRatio: .5,
    totalMass: 132,
    extinct: true
}

export const testPlant3 = {
    depth: 1,
    droughtTolerance: 4,
    foliageMass: 104,
    foliageProfile: [21, 77, 1, 3],
    foliageRatio: 0.7878787878787878,
    foliageStrength: 0.08,
    height: 4,
    id: "3-3-3-3-3-3-3-3-3-3",
    minPrecip: 0,
    minTemp: -30,
    name: "___ Test Plant 3 ___",
    rootMass: 28,
    rootProfile: [27],
    rootRatio: 0.21212121212121213,
    biomes: [],
    solarRatio: .5,
    totalMass: 132,
    extinct: true
}

export const seedConifer1 = {
    depth: 5,
    foliageMass: 104,
    foliageProfile: [2, 4, 5, 7, 9, 8, 12, 15, 18, 23, 27],
    id: "SEED_CONIFER_1",
    name: "___ Seed Conifer 1 ___",
    rootMass: 28,
    rootProfile: [60, 12, 2, 1, 1, 1, 1, 1, 1],
    biomes: [],
    extinct: true
}

export const seedConifer2 = {
    depth: 5,
    foliageProfile: [2,4,5,7,9,8,12],
    id: "SEED_CONIFER_2",
    name: "___ Seed Conifer 2 ___",
    rootMass: 28,
    rootProfile: [30, 12, 2, 1, 1, 1],
    biomes: [],
    extinct: true
}

export const generic1 = {
    depth: 1,
    foliageProfile: [3],
    id: "GENERIC_1",
    name: "___ Generic 1 ___",
    rootProfile: [3],
    biomes: [],
    extinct: true
}


/*
Environment Averages:
Desert -- precip: 0 - 2
Savannah -- precip: 0 - 4
Grassland -- precip 4 - 8
Scrub forest -- precip 6 - 10
Forest -- precip 8 - 14
Rainforest -- precip 10 - 20


Arctic / Mountain peak -- temp: 0 - 25
Tundra / Alpine -- temp: 0 - 50
Temperate -- temp: 10 - 60
Sub-Tropical -- temp: 30 - 70
Tropical -- temp: 50 - 110
*/

let nameArray1 = ["Running", "Spindly","Tall", "Purple", "Red", "Golden", "Climbing", "Flowering", "Twining", "Seasonal", "Bitter", "Olive", "Twighlight", "Dwarf", "Brilliant", "Wooly", "Leo's", "Eli's", "Anna's", "Grand"];
let nameArray2 = ["Daisy", "Rose", "Shrub", "Grass", "Reed", "Thorn", "Bramble", "Clover", "Weed", "Burnock", "Salal", "Grape", "Wood", "Oka", "Vine", "Lupine", "Fir", "Heather", "Root", "Paintbrush", "Flag", "Star"];


function distributePlantMass(length, mass) {
    let massLeft = mass;
    let profile = [];
    // const minWidth = Math.ceil(mass / 10);

    for (let level = length; level > 0; level--) {
        if(massLeft > 0) {
            const levelAdd = clamp(random(1, massLeft - level), 1, 50);
            profile.push(levelAdd);
            massLeft -= levelAdd;
        } else {
            console.log('DISTIBUTION ERROR!!!!!!!!!!!!!!!!!!! massLeft', massLeft, 'level', level);
            console.log('original mass', mass, 'original length', length);
        }
    }

    return profile;
}

function getFoliageStrength(plant) {
    const profile = plant.foliageProfile;
    const mass = plant.foliageMass;

    //   console.log('getFoliageStrength');

    let score = profile.length;
    // console.log('score before', score);


    for (let index = 0; index < profile.length; index++) {
        const layer = profile[index];
        const lowerLayer = profile[index + 1];

        if(lowerLayer){
            if (lowerLayer < layer) {
                // console.log('reducing score', layer, lowerLayer);

                score--;
            } else if (lowerLayer === layer) {
                // console.log('reducing score', layer, lowerLayer);

                score -= .5;
            } else {
                score ++;
            }
        }
    }
    // console.log('score after', score);


    return clamp(round((score / profile.length), 2), 0, 1);
}

// function getFoliageStrength(plant) {
//     if(plant.height <= 1) {
//         return 1;
//     }

//     const {upperHalf, lowerHalf, upperMidQuarter, lowerMidQuarter, topQuarter, bottomQuarter} = plant;
//     let score = 0;

//     if(plant) {
//         score = sum(lowerHalf) / sum(upperHalf);
//     }

//     return clamp(round((score), 2), 0, 1);
// }


function getSolarGain(profile, mass) {
    if(profile.length <= 1) {
        return profile[0];
    }

    const halfWay = Math.floor(profile.length / 2);

    let lower = 0;
    let upper = 0;

    for (let index = 0; index < halfWay; index++) {
        upper += profile[index];
        lower += profile[profile.length - index - 1];
    }

    return round((upper * 2) + lower, 2) || 1;
}

export function applySurvivalStatsToPlant(plant) {
    plant.height = plant.foliageProfile.length;
    plant.foliageMass = sum(plant.foliageProfile);
    plant.rootMass = sum(plant.rootProfile);
    plant.totalMass = plant.foliageMass + plant.rootMass;
    plant.upperHalf = null;
    plant.lowerHalf = null;
    plant.topQuarter = null;
    plant.upperMidQuarter = null;
    plant.lowerMidQuarter = null;
    plant.bottomQuarter = null;

    if(plant.height >= 2) {
        let halves = fractionArray(plant.foliageProfile, 2);
        plant.upperHalf = halves[0];
        plant.lowerHalf = halves[1];
    }

    if(plant.height >= 4) {
        let quarters = fractionArray(plant.foliageProfile, 4);
        plant.topQuarter = quarters[0];
        plant.upperMidQuarter = quarters[1];
        plant.lowerMidQuarter = quarters[2];
        plant.bottomQuarter = quarters[3];
    }

    plant.rootRatio = plant.rootMass / plant.totalMass;
    plant.foliageRatio = plant.foliageMass / plant.totalMass;

    plant.foliageStrength = getFoliageStrength(plant);


    const solarGain = getSolarGain(plant.foliageProfile);
    plant.solarRatio = round(solarGain / plant.totalMass, 2);

    if (plant.solarRatio > maxPlant.solarRatio) {
        maxPlant = plant;
    }

    const adjustedStrength = clamp(plant.foliageStrength, 0, 2);
    const rootSurfaceSpread = plant.rootProfile && plant.rootProfile[0] || 1;
    const rootSurfaceSpreadRatio = rootSurfaceSpread / plant.totalMass;
    const rootDepthRatio = round((plant.rootProfile && plant.rootProfile.length || 1) / plant.totalMass, 2); // (.002 1)

    plant.name = sample(nameArray1) + " " + sample(nameArray2);
    plant.minTemp = matchInverseRangeToRange([0, 70], [0, 1], adjustedStrength, 2);
    plant.minPrecip = matchInverseRangeToRange([.1, 20], [.01, .5], rootSurfaceSpreadRatio, 2);
    plant.droughtTolerance = matchRangeToRange([0, 4,], [.01, .1], rootDepthRatio);
}

export function generateRandomPlant(id) {
    /*
    Plant survival logic:
    If square precip and temp stats are outside range- do not add
    If square conditions are in range add and calculate survival score

    Factors:
    Plants are not limited by maxTemp or maxPrecip.
    Because minTemp and minPrecip both limit solarGain and solarEfficiency, plants with
    lower minTemp or minPrecip will be out-competed in more ideal environments

    minTemp(-10 - 70): determined by foliageStrength

    minPrecip(1 - 15): determined by root-spread

    droughtTolerance(0 - 3): determined by rootDepth
    */

    const totalMass = random(5, 20);
    const rootMass = Math.floor(totalMass * random(.2, .8));
    const foliageMass = totalMass - rootMass;

    const maxHeight = Math.floor(foliageMass / 10);
    const maxDepth = Math.floor(rootMass / 10);

    const height = random(1, 1) || 1;
    const depth = random(1, 1) || 1;

    let plant = {
        id,
        ancestor: null,
        totalMass,
        rootMass,
        foliageMass,
        height,
        depth,
        foliageProfile: distributePlantMass(height, foliageMass),
        rootProfile: distributePlantMass(depth, rootMass),
        biomes: [],
        extinct: true
    }

    applySurvivalStatsToPlant(plant);

    return plant;
}

export function loadPlantArray(number) {
    console.log('loadPlantArray');

    let plantObj = {};
    let plantArray = [];
    // let test = matchInverseRangeToRange([1, 15], [1, 20], 20); // 7
    // console.log('test', test === 1, test);

    // test = matchInverseRangeToRange([1, 15], [1, 20], 1); // 7
    // console.log('test', test === 15, test);

    // for (let count = 0; count < number; count++) {
    //     let id = shortid.generate();
    //     let plant = generateRandomPlant(id)
    //     plantObj[id] = plant;

    //     plantArray.push(plant.id);
    // }
    applySurvivalStatsToPlant(generic1);

    plantObj[generic1.id] = generic1;
    plantArray.push(generic1.id)
    testPlantAgainstDiffArray(generic1)
    console.log('*****************************************************************');

    console.log('maxScore', maxPlant.solarRatio, maxPlant.name);
    console.log('Max Plant', maxPlant);
    console.log('*****************************************************************');

    return {plantObj, plantArray};
}
