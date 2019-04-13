import {sample, clamp, round, cloneDeep, sum} from "lodash";
import shortid from "shortid";
import {random, matchInverseRangeToRange, matchRangeToRange, fractionArray} from "../utilities";
import {world, globalGrid, globalZoomArray, plants} from "../../store/state";

const forestAntelope = {
  id: "___FOREST_ANTELOPE___",
  name: "Forest Antelope",
  biomes: [],
  weight: 40,
  dietLayer: 2,
  // Escape
  agilitySpeed: 90,
  enduranceSpeed: 10,
  climb: 0,
  dig: 0,
  swim: 0,
  fly: 0,
  // Defense
  strength: 5,
  armor: 0,
  horn: 0,
  poison: 0,
  spines: 0,
  claws: 0
}

const plainsAntelope = {
  id: "___PLAINS_ANTELOPE___",
  name: "Plains Antelope",
  biomes: [],
  weight: 60,
  dietLayer: 0,
  // Escape
  agilitySpeed: 10,
  enduranceSpeed: 90,
  climb: 0,
  dig: 0,
  swim: 0,
  fly: 0,
  // Defense
  strength: 5,
  armor: 0,
  horn: 0,
  poison: 0,
  spines: 0,
  claws: 0
}

const squirrel = {
  id: "___Squirrel___",
  name: "Squirrel",
  biomes: [],
  weight: 1,
  dietLayer: 3,
  // Escape
  agilitySpeed: 20,
  enduranceSpeed: 0,
  climb: 1,
  dig: 0,
  swim: 0,
  fly: 0,
  // Defense
  strength: 1,
  armor: 0,
  horn: 0,
  poison: 0,
  spines: 0,
  claws: 0
}

const hippo = {
  id: "___Hippo___",
  name: "Hippo",
  biomes: [],
  weight: 2000,
  dietLayer: 0,
  // Escape
  agilitySpeed: 10,
  enduranceSpeed: 0,
  climb: 0,
  dig: 0,
  swim: 1,
  fly: 0,
  // Defense
  strength: 80,
  armor: 0,
  horn: 0,
  poison: 0,
  spines: 0,
  claws: 0,
  teeth: 10
}

const prairieDog = {
  id: "___Prairie_Dog___",
  name: "Prairie Dog",
  biomes: [],
  weight: 2,
  dietLayer: 0,
  // Escape
  agilitySpeed: 0,
  enduranceSpeed: 0,
  climb: 0,
  dig: 1,
  swim: 0,
  fly: 0,
  // Defense
  strength: 1,
  armor: 0,
  horn: 0,
  poison: 0,
  spines: 0,
  claws: 0,
  teeth: 0
}

const paradiseCat = {
  id: "___PARADISE_CAT___",
  name: "Paradise Cat",
  biomes: [],
  weight: 95,
  dietLayer: 2,
  // Escape
  agilitySpeed: 80,
  enduranceSpeed: 10,
  climb: .8,
  dig: .1,
  swim: .1,
  fly: 0,
  // Defense
  strength: 20,
  armor: 0,
  horn: 0,
  poison: 0,
  spines: 0,
  claws: 0,
  teeth: 0
}

function getDietScore(dietLayer, plants) {
  // console.log("GetDietScore", dietLayer, plants);
  if(!plants[dietLayer] || plants[dietLayer] && plants[dietLayer].length === 0) {
    return 0;
  }

  return plants[dietLayer].length / 5;
}

function getUpperPlantDensity(plants) {
  let height2 = plants[2] &&  plants[2].length || 0;
  let height3 = plants[3] &&  plants[3].length || 0;
  let height4 = plants[4] &&  plants[4].length || 0;
  
  return round((height2 + height3 + height4) / 15, 2);
}

function getRunEscapeScore(animal, biome) {
  const plants = biome.plantNiches;
  const {enduranceSpeed, agilitySpeed} = animal;
  let totalScore = 0;
  let density = getUpperPlantDensity(plants);  

  let endurancePotential = 1 - density;
  let agilityPotential = density;

  let enduranceBonus = enduranceSpeed * endurancePotential;
  let agilityBonus = agilitySpeed * agilityPotential;

  return round((agilityBonus + enduranceBonus) / 100, 2);
}

function getClimbEscapeScore(animal, biome) {
  if(!animal.climb) {
    return 0;
  }

  let climbLevel1 = biome.plantNiches[3] ? biome.plantNiches[3].length : 0;
  let climbLevel2 = biome.plantNiches[4] ? biome.plantNiches[4].length : 0;

  let totalClimbDensity = (climbLevel1 + climbLevel2) / 10;
  
  return animal.climb * totalClimbDensity;
}

function getClimbEscapeScore(animal, biome) {
  if(!animal.climb) {
    return 0;
  }

  let climbLevel1 = biome.plantNiches[3] ? biome.plantNiches[3].length : 0;
  let climbLevel2 = biome.plantNiches[4] ? biome.plantNiches[4].length : 0;

  let totalClimbPotential = (climbLevel1 + climbLevel2) / 10;
  
  return animal.climb * totalClimbPotential;
}

function getDigEscapeScore(animal, biome) {
  return animal.dig;
}

function getSwimEscapeScore(animal, biome) {
  if(!animal.swim) {
    return 0;
  }  
  
  // console.log("biome.avgPrecip", biome.avgPrecip);
  
  let swimPotential = biome.avgPrecip / 100;
  // console.log("swimPotential", swimPotential);
   
  
  return animal.swim * swimPotential;
}

function getEscapeScore(animal, biome) {
  let runEscape = getRunEscapeScore(animal, biome);
  let climbEscape = getClimbEscapeScore(animal, biome);
  let digEscape = getDigEscapeScore(animal, biome);
  let swimEscape = getSwimEscapeScore(animal, biome);

  // console.log("Escape Scores");
  // console.log("Run", runEscape);
  // console.log("Climb", climbEscape);
  // console.log("Dig", digEscape);
  // console.log("Swim", swimEscape);
  
  let totalEscape = runEscape + climbEscape + digEscape + swimEscape;
  // console.log("Total", totalEscape);

  return totalEscape;
}

export function calculateSurvivalScores(animal, biome) {
  // console.log("*********************", animal.name);
  
  let dietScore = round(getDietScore(animal.dietLayer, biome.plantNiches), 2);
  // console.log("Diet score for biome", biome.id, "=", dietScore);
  let escapeScore = round(getEscapeScore(animal, biome), 2);
  // console.log("Escape score for biome", biome.id, "=", escapeScore);

  let totalScore = dietScore + escapeScore;
  let canSurvive = dietScore > .2 && totalScore > 1;


  return {
    dietScore,
    escapeScore,
    totalScore,
    canSurvive
  }

  // console.log("score for biome", biome.id, "=", survivalScore);
  
  // console.log("------------------------------------------------");
}

export function loadAnimalArray() {
  let animalObj = {};
  let animalArray = [];

  for (let index = 0; index < animals.length; index++) {
    const animal = animals[index];
    animalArray.push(animal.id);
    animalObj[animal.id] = animal;
  }

  return {
    animalObj,
    animalArray
  }
}

let biome1 = {
  id: "rainforest",
  avgPrecip: 60,
  plantNiches: [
    [1,1],
    [1,1,1],
    [1,1,1,1],
    [1,1,1,1,1],
    [1,1,1,1,1],
  ]
}
let biome2 = {
  id: "open forest",
  avgPrecip: 40,
  plantNiches: [
    [1,1],
    [1,1,1],
    [1,1,1,1],
    [1,1,1,1],
    [1,1,1],
  ]
}
let biome3 = {
  id: "savannah",
  avgPrecip: 30,
  plantNiches: [
    [1,1,1,1,1],
    [1,1,1,1],
    [1,1],
    [1,1],
  ]
}
let biome4 = {
  id: "steppe",
  avgPrecip: 10,
  plantNiches: [
    [1,1,1,1,1],
    [1,1]
  ]
}

let biomes = [biome1, biome2, biome3, biome4];
let animals = [forestAntelope, plainsAntelope, squirrel, hippo, prairieDog, paradiseCat];
// let animals = [paradiseCat];

// for (let index = 0; index < animals.length; index++) {
//   const animal = animals[index];
//   for (let biomeIndex = 0; biomeIndex < biomes.length; biomeIndex++) {
//     const biome = biomes[biomeIndex];
//     calculateSurvivalScores(animal, biome);
//   }
// }
