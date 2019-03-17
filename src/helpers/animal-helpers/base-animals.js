import {sample, clamp, round} from "lodash";
import {random, matchInverseRangeToRange, matchRangeToRange} from "../utilities";

let maxPlant = {solarRatio: 0, name:"NONE"};

let testPlant = {
    depth: 1,
    droughtTolerance: 3,
    foliageMass: 104,
    foliageProfile: [21, 77, 1, 3],
    foliageRatio: 0.7878787878787878,
    foliageStrength: 0.08,
    height: 4,
    id: 1000,
    minPrecip: 0,
    minTemp: -30,
    name: "___ Test Plant ___",
    rootMass: 28,
    rootProfile: [27],
    rootRatio: 0.21212121212121213,
    solarRatio: 50,
    totalMass: 132
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



export const plantArray = [];

let nameArray1 = ["Running", "Spindly","Tall", "Purple", "Red", "Golden", "Climbing", "Flowering", "Twining", "Seasonal", "Bitter", "Olive", "Twighlight", "Dwarf", "Brilliant", "Wooly", "Leo's", "Eli's", "Anna's", "Grand"];
let nameArray2 = ["Daisy", "Rose", "Shrub", "Grass", "Reed", "Thorn", "Bramble", "Clover", "Weed", "Burnock", "Salal", "Grape", "Wood", "Oka", "Vine", "Lupine", "Fir", "Heather", "Root", "Paintbrush", "Flag", "Star"];

function distributePlantMass(length, mass) {
    let massLeft = mass;
    let profile = [];
    // const minWidth = Math.ceil(mass / 10);

    for (let level = length; level > 0; level--) {
        if(massLeft > 0) {
            const levelAdd = random(1, massLeft - level);
            profile.push(levelAdd);
            massLeft -= levelAdd;
        } else {
            console.log('DISTIBUTION ERROR!!!!!!!!!!!!!!!!!!! massLeft', massLeft, 'level', level);
            console.log('original mass', mass, 'original length', length);
        }
    }

    return profile;
}

function getFoliageStength(profile) {
    if(profile.length <= 1) {
        return 1;
    }

    const halfWay = Math.ceil(profile.length / 2);

    let lower = 0;
    let upper = 0;

    for (let index = 0; index < halfWay; index++) {
        upper += profile[index];
        lower += profile[profile.length - index - 1];
    }

    return round((lower / upper) * 2, 2);
}

// function getSolarEfficiency(profile) {
//     if(profile.length <= 1) {
//         return 5;
//     }

//     const halfWay = Math.ceil(profile.length / 2);

//     let lower = 0;
//     let upper = 0;

//     for (let index = 0; index < halfWay; index++) {
//         upper += profile[index];
//         lower += profile[profile.length - index - 1];
//     }

//     return round((upper / lower) * 2, 2);
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



export function generateRandomPlant(index) {
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

    const totalMass = random(5, 200);
    const rootMass = Math.floor(totalMass * random(.2, .8));
    const foliageMass = totalMass - rootMass;
    const rootRatio = rootMass / totalMass;
    const foliageRatio = foliageMass / totalMass;

    const maxHeight = Math.floor(foliageMass / 10);
    const maxDepth = Math.floor(rootMass / 10);

    const height = random(1, maxHeight) || 1;
    const depth = random(1, maxDepth) || 1;

    let plant = {
        totalMass,
        rootMass,
        foliageMass,
        rootRatio,
        foliageRatio,
        height,
        depth,
        foliageProfile: distributePlantMass(height, foliageMass),
        rootProfile: distributePlantMass(depth, rootMass),
    }

    plant.foliageStrength = getFoliageStength(plant.foliageProfile);

    const solarGain = getSolarGain(plant.foliageProfile);
    plant.solarRatio = round(solarGain / plant.totalMass, 2);

    if(plant.solarRatio > maxPlant.solarRatio) {
        maxPlant = plant;
    }

    const adjustedStrength = clamp(plant.foliageStrength, 0, 2);
    const rootSurfaceSpread = plant.rootProfile && plant.rootProfile[0] || 1;
    const rootSurfaceSpreadRatio = rootSurfaceSpread / plant.totalMass;
    const rootDepthRatio = round((plant.rootProfile && plant.rootProfile.length || 1) / plant.totalMass, 2); // (.002 1)

    plant.name = sample(nameArray1) + " " + sample(nameArray2);
    plant.id = index;

    plant.minTemp = matchInverseRangeToRange([-10, 70], [0, 2], adjustedStrength);
    plant.minPrecip = matchInverseRangeToRange([1, 15], [.01, .7], rootSurfaceSpreadRatio);
    plant.droughtTolerance = round(matchRangeToRange([0, 3], [.01, .2], rootDepthRatio));

    return plant;
}

export function loadPlantArray(number) {
    // let test = matchInverseRangeToRange([1, 15], [1, 20], 20); // 7
    // console.log('test', test === 1, test);

    // test = matchInverseRangeToRange([1, 15], [1, 20], 1); // 7
    // console.log('test', test === 15, test);

    for (let count = 0; count < number; count++) {
        const plant = generateRandomPlant(count);

        plantArray.push(plant);
    }
    console.log('*****************************************************************');

    console.log('maxScore', maxPlant.solarRatio, maxPlant.name);
    console.log('Max Plant', maxPlant);
    console.log('*****************************************************************');
    // plantArray.push(testPlant);

    return plantArray;
    // return [];
}
