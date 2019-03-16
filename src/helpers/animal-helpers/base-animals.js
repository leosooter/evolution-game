import {sample, clamp, round} from "lodash";
import {random} from "../utilities";

let maxPlant = {solarRatio: 0, name:"NONE"};


let grazer1 = {
    name: "Desert Antelope",
    precipProfile: [5,5,5,5],
    precipTolerance: 5,
    tempProfile: [50,50,50,50],
    temmpTolerance: 10,
    browseProfile: [0,90,5,5,0],
}


let plant1 = {
    name: "Desert Pea",
    precipProfile: [1,0,0,1],
    precipTolerance: 20,
    tempProfile: [50,60,70,60],
    tempTolerance: 40,
    growthProfile: [10,90,0,0]
}

let plant2 = {
    name: "Desert Rose",
    precipProfile: [10, 1, 0, 5],
    precipTolerance: 10,
    tempProfile: [60, 70, 80, 70],
    tempTolerance: 60,
    growthProfile: [10, 90, 0, 0]
}

let plant3 = {
    name: "Marsh Reed",
    precipProfile: [20, 15, 10, 17],
    precipTolerance: 40,
    tempProfile: [30, 40, 60, 40],
    tempTolerance: 80,
    growthProfile: [10, 90, 0, 0]
}

let testPlant = {
    basePrecip: 14,
    baseTemp: 98,
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
    precipProfile: [10, 17, 14, 12],
    precipTolerance: 21.21,
    rootMass: 28,
    rootProfile: [27],
    rootRatio: 0.21212121212121213,
    solarRatio: 50,
    tempProfile: [99, 95, 102, 102],
    tempTolerance: 6,
    totalMass: 132
}


// let plant4 = {
//     name: "Desert Rose",
//     precipProfile: [10, 1, 0, 5],
//     precipTolerance: 10,
//     tempProfile: [60, 70, 80, 70],
//     tempTolerance: 60,
//     growthProfile: [10, 90, 0, 0]
// }


// let plant5 = {
//     name: "Desert Rose",
//     precipProfile: [10, 1, 0, 5],
//     precipTolerance: 10,
//     tempProfile: [60, 70, 80, 70],
//     tempTolerance: 60,
//     growthProfile: [10, 90, 0, 0]
// }


// let plant6 = {
//     name: "Desert Rose",
//     precipProfile: [10, 1, 0, 5],
//     precipTolerance: 10,
//     tempProfile: [60, 70, 80, 70],
//     tempTolerance: 60,
//     growthProfile: [10, 90, 0, 0]
// }

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

export const herbivoreArray = [
    grazer1
];

export function newPlant(basePlant, precipScore, tempScore) {
    return {
        ...basePlant,
        precipScore,
        tempScore,
        survivalScore: Math.floor(precipScore + tempScore)
    }
}

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

function getValue(base, power) {
    return clamp(base + random(power * -1, power), 0, 120);
}

function matchRangeToRange(targetRange, valueRange, value) {
    if (value === 0) {
        return 0
    }

    const targetDiff = targetRange[1] - targetRange[0];
    const valueDiff = valueRange[1] - valueRange[0];
    const adjust = valueDiff / targetDiff;

    return clamp(round((value / adjust), 2), targetRange[0], targetRange[1]);
}

function matchInverseRangeToRange(targetRange, valueRange, value) {
    if (value === 0) {
        return 0
    }

    const targetDiff = targetRange[1] - targetRange[0];
    const valueDiff = valueRange[1] - valueRange[0];
    const adjust = valueDiff / targetDiff;

    return clamp(round(targetRange[1] - (value / adjust), 2), targetRange[0], targetRange[1]);
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
    // console.log('@@@@@@@@@ foliageStrength', plant.foliageStrength);

    const solarGain = getSolarGain(plant.foliageProfile);
    plant.solarRatio = round(solarGain / plant.totalMass, 2);

    if(plant.solarRatio > maxPlant.solarRatio) {
        maxPlant = plant;
    }

    const minTemp = clamp(round(100 - (plant.foliageStrength * 100), 0), -20, 100);
    plant.basePrecip = random(1, 15);

    /*
        Base temp varies by plant foliage-strength. Plants with high strength can grow anywhere, but the lower a plants strength,
        the more restricted it is to higher temps.
    */
    plant.baseTemp = random(minTemp, 100);

    /*
        tempTolerance Factors:
        increased by foliage-strength .1 - %20
        increased by rootRatio .1 - .9
    */
    const adjustedStrength = clamp(plant.foliageStrength, 0, 2);

    const adjustedRootRatio = plant.rootRatio;
    const rootSurfaceSpread = plant.rootProfile && plant.rootProfile[0] || 1;
    const rootDepthRatio = round((plant.rootProfile && plant.rootProfile.length || 1) / plant.totalMass, 2); // (.002 1)
    // console.log('adjustedRootMass', adjustedRootRatio);
    const tempTolerance = clamp(round(20 * (adjustedRootRatio + adjustedStrength), 0), 1, 100);
    plant.tempTolerance = tempTolerance;


    /*
        precipTolerance Factors:
        increased by root-topSpread
        increased by root-depth as percent of mass
    */
    plant.precipTolerance = round(100 * rootRatio, 2);

    /*
        totalSurvivalScore Factors:
        increased by precipScore
        increased by tempScore
        increased by solarGain / mass
        increased by efficiency vs surrounding plants
    */

    const rootSurfaceSpreadRatio = rootSurfaceSpread / plant.totalMass;

    plant.precipProfile = [getValue(plant.basePrecip, 5), getValue(plant.basePrecip, 5), getValue(plant.basePrecip, 5), getValue(plant.basePrecip, 5)];
    plant.tempProfile = [getValue(plant.baseTemp, 5), getValue(plant.baseTemp, 5), getValue(plant.baseTemp, 5), getValue(plant.baseTemp, 5)];
    plant.name = sample(nameArray1) + " " + sample(nameArray2);
    plant.id = index;


    plant.minTemp = matchInverseRangeToRange([-10, 70], [0, 2], adjustedStrength);
    plant.minPrecip = matchInverseRangeToRange([1, 15], [.01, .7], rootSurfaceSpreadRatio);
    plant.droughtTolerance = round(matchRangeToRange([0, 3], [.01, .2], rootDepthRatio));

    console.log('plant.rootProfile && plant.rootProfile[0]', plant.rootProfile && plant.rootProfile[0]);
    console.log('rootSurfaceSpreadRatio', rootSurfaceSpreadRatio);
    console.log('plant.minPrecip', plant.minPrecip);


    // console.log('plant.droughtTolerance', plant.droughtTolerance);
    return plant;
}

export function loadPlantArray(number) {
    let test = matchInverseRangeToRange([1, 15], [1, 20], 20); // 7
    console.log('test', test === 1, test);

    test = matchInverseRangeToRange([1, 15], [1, 20], 1); // 7
    console.log('test', test === 15, test);

    let avgPrecipArray = [];
    let avgPrecip = 0;
    let avgPrecipTolerance = 0;
    let maxPrecipTolerance = 0;
    let minPrecipTolerance = 100;

    let avgTempArray = [];
    let avgTemp = 0;
    let lowTemp = 100;
    let highTemp = 0;
    let avgTempTolerance = 0;
    let maxTempTolerance = 0;
    let minTempTolerance = 100;

    for (let count = 0; count < number; count++) {
        const plant = generateRandomPlant(count);
        avgPrecipArray.push(plant.basePrecip);
        avgPrecip += plant.basePrecip;
        avgPrecipTolerance += plant.precipTolerance;
        if(plant.precipTolerance > maxPrecipTolerance) {
            maxPrecipTolerance = plant.precipTolerance;
        }

        if (plant.precipTolerance < minPrecipTolerance) {
            minPrecipTolerance = plant.precipTolerance;
        }

        avgTempArray.push(plant.baseTemp);
        avgTemp += plant.baseTemp;
        avgTempTolerance += plant.tempTolerance;
        if(plant.tempTolerance > maxTempTolerance) {
            maxTempTolerance = plant.tempTolerance;
        }

        if (plant.tempTolerance < minTempTolerance) {
            minTempTolerance = plant.tempTolerance;
        }

        if(plant.baseTemp > highTemp) {
            highTemp = plant.baseTemp;
        }

        if (plant.baseTemp < lowTemp) {
            lowTemp = plant.baseTemp;
        }

        plantArray.push(plant);
    }

    avgPrecip = round(avgPrecip / number);
    avgPrecipTolerance = round(avgPrecipTolerance / number);
    avgTemp = round(avgTemp / number);
    avgTempTolerance = round(avgTempTolerance / number);

    console.log('!!!!!!!!!!!!!!!!!!Precip');
    console.log('avgPrecipArray', avgPrecipArray);
    console.log('avgPrecip', avgPrecip);
    console.log('avgPrecipTolerance', avgPrecipTolerance);
    console.log('maxPrecipTolerance', maxPrecipTolerance);
    console.log('minPrecipTolerance', minPrecipTolerance);

    console.log('!!!!!!!!!!!!!!!!!!Temp');
    console.log('avgTempArray', avgTempArray);
    console.log('avgTemp', avgTemp);
    console.log('lowTemp', lowTemp);
    console.log('highTemp', highTemp);


    console.log('avgTempTolerance', avgTempTolerance);
    console.log('maxTempTolerance', maxTempTolerance);
    console.log('minTempTolerance', minTempTolerance);

    console.log('*****************************************************************');

    console.log('maxScore', maxPlant.solarRatio, maxPlant.name);
    console.log('Max Plant', maxPlant);
    console.log('*****************************************************************');
    plantArray.push(testPlant);

    return plantArray;
    // return [];

}
