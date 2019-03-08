import {random, sample, round, cloneDeep} from "lodash";
import {evolveAnimal, evolveAnimalForTrait} from "./evolve-animal";
import {updateTraits, weightedChance} from "./calculate";
import {canSurvive} from "./survival";

export const animalTemplate = {
    size: [
        "bodyLength",
        "bodyHeight",
        "headLength",
        "headHeight",
        "legLength",
        "legWidth",
        "tailLength",
        "tailWidth",
        "snoutHeight",
        "snoutLength",
        "earLength",
        "earWidth",
        "neckHeight",
        "neckLength",
        "tailOffset",
        "neckOffset",
        "snoutOffset"
    ],
    traits: [
        "bodyMass",
        "headMass",
        "legMass",
        "totalMass",
        "weight",
        "legThickness",
        "legSpeed",
        "speed",
        "acceleration",
        "endurance",
        "armStrength",
        "biteForce",
        "neckStrength",
        "attackStrength",
        "browseMax",
        "browseMin"
    ]
}

const dietArray = [
    {value: "herbivore", chance: .7},
    {value: "omnivore", chance: .2},
    {value: "carnivore", chance: .1},
];


export function generateNewAnimal() {
    let safety = 0;
    const diet = weightedChance(dietArray, "herbivore");

    while(safety < 1000) {
        safety ++;
        const size = {};
        size.bodyLength = random(10, 300);
        size.bodyHeight = Math.floor(size.bodyLength / random(1, 3));
        size.headLength = Math.floor(size.bodyLength / random(5, 8));
        size.headHeight = Math.floor(size.headLength / random(1, 2.5));
        size.legLength = Math.floor(size.bodyLength / random(.5, 4));
        size.legWidth = Math.floor(size.legLength / random(3, 10));
        size.tailLength = Math.floor(size.bodyLength / random(1, 20));
        size.tailWidth = Math.floor(size.tailLength / random(1, 10));
        size.snoutHeight = Math.floor(size.headHeight / random(1.1, 2));
        size.snoutLength = Math.floor(size.snoutHeight / random(.5, 2));

        size.earLength = Math.floor(size.headLength / random(1, 5));
        size.earWidth = Math.floor(size.headLength / random(3, 6));
        size.neckHeight = Math.floor(size.headHeight / random(1, 1.5));
        size.neckLength = Math.floor(size.neckHeight / random(.1, 2));

        size.tailOffset = Math.floor(size.bodyHeight / random(4, 10));
        size.neckOffset = Math.floor(size.bodyHeight / random(10, 1000));
        size.snoutOffset = Math.floor(random(0, (size.headHeight - size.snoutHeight)));

        const traits = updateTraits(size);

        const base = {
            size,
            traits
        };

        if (canSurvive(base)) {
            // survival = true;
            return base;
        };
    }

    console.log('############### no viable animal generated');

};

export function generateDefinedAnimal(template) {
    let survival = false;

    while (!survival) {
        const size = cloneDeep(template);

        const traits = updateTraits(size);
        const base = {
            size,
            traits
        }

        if (canSurvive(base)) {
            survival = true;
            return base;
        };
    }
};

export function generateTraitsEvolvedAnimal(traits, generations = 20) {
    let trait = traits[0];
    let newAnimal = generateNewAnimal();

    for (let index = 0; index < generations; index++) {
        newAnimal = evolveAnimalForTrait(trait, newAnimal);
    }

    return newAnimal;
}

