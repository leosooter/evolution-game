import {random, sample, round, cloneDeep} from "lodash";
import {updateTraits} from "./calculate";
import {canSurvive} from "./survival";

function mutateTrait(trait) {
    let modifier = trait / random(5, 10);
    let chance = random(1,5);

    if(chance <= 3) {
        return trait;
    }

    return round(chance === 4 ? trait + modifier : trait - modifier);
}


export function randomEvolveAnimal(base, mutations = 10) {
    let newMutations = [];

    if (newMutations.length) {
        return sample(newMutations);
    }

    return base;
}




export function evolveAnimal(base, mutations = 10) {
    let newMutations = [];
    if (canSurvive(base)) {
        newMutations.push(cloneDeep(base));
    }

    for (let index = 0; index < mutations; index++) {
        let newAnimal = cloneDeep(base);

        for (const trait in newAnimal.size) {
            if (newAnimal.size.hasOwnProperty(trait)) {
                newAnimal.size[trait] = mutateTrait(newAnimal.size[trait]);
            }
        }

        newAnimal.traits = updateTraits(newAnimal.size);
        if (canSurvive(newAnimal)) {
            newMutations.push(newAnimal);
        }
    }

    return newMutations;
}

export function evolveAnimalForTrait(trait, base, mutations = 10, generations) {
    if (!canSurvive(base)) {
        return base;
    }
    let newAnimals = evolveAnimal(base, mutations);

    let bestMutationIndex = 0;

    for (let index = 0; index < newAnimals.length; index++) {
        const traitScore = newAnimals[index].traits[trait];

        if (traitScore > newAnimals[bestMutationIndex].traits[trait]) {
            bestMutationIndex = index;
        }
    }

    let {
        legLength,
        bodyLength,
        legWidth
    } = newAnimals[bestMutationIndex].size

    return newAnimals[bestMutationIndex];
}

export function evolveAnimalWithinNiches(base, mutations = 10, generations) {
    let newAnimal = cloneDeep(base);

    let newAnimals = evolveAnimal(newAnimal, mutations);

    let bestMutationIndex = 0;

    for (let index = 0; index < newAnimals.length; index++) {
        const traitScore = newAnimals[index][trait];

        if (traitScore > newAnimals[bestMutationIndex][trait]) {
            bestMutationIndex = index;
        }
    }

    return newAnimals[bestMutationIndex];
}
