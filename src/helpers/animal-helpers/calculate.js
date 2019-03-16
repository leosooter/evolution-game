import {cloneDeep, round, random} from "lodash";
import { randomEvolveAnimal } from "./evolve-animal";

const getDiffFromIdeal = (value, ideal, range) => {
    // returns a value from 1 to 0. 1 for ideal, o for outside range.

    if(value < ideal - range || value > ideal + range) {
        return 0;
    }

    const diffFromIdeal = ideal - Math.abs(value - ideal);
    const percentValue = round(diffFromIdeal / ideal, 2);

    return round(percentValue, 2);
}

export function weightedChance(valueArray, defaultValue) {
    const rand = random(1, 100);

    let current = 0;

    for (let index = 0; index < valueArray.length; index++) {
        const max = current + (100 * valueArray[index].chance);
        if(rand > current && rand <= max) {
            return valueArray[index].value;
        }

        current = max;
    }

    return defaultValue;

}

function getBiteForce(headHeight, headLength, snoutHeight, snoutLength, totalMass) {
    const IDEAL_HEAD_HEIGHT_TO_HEAD_LENGTH = 1.3;
    const IDEAL_SNOUT_HEIGHT_TO_SNOUT_LENGTH = 1.2;
    const IDEAL_SNOUT_TO_HEAD = 1;
    const IDEAL_HEAD_MASS_TO_TOTAL_MASS = .3;

    const idealHeadHeightModifier = 1;
    const idealSnoutHeightModifier = 1;
    const idealSnoutToHeadModifier = 1;
    const headMassModifier = 10;
    const finalModifier = 1;

    const idealHeadHeightToHeadLength = round(getDiffFromIdeal(headHeight / headLength, IDEAL_HEAD_HEIGHT_TO_HEAD_LENGTH, 1) * idealHeadHeightModifier, 2);
    const idealSnoutHeightToSnoutLength = round(getDiffFromIdeal(snoutHeight / snoutLength, IDEAL_SNOUT_HEIGHT_TO_SNOUT_LENGTH, 1) * idealSnoutHeightModifier, 2);
    const idealSnoutToHead = round(getDiffFromIdeal((snoutHeight * snoutLength) / (headHeight * headLength), IDEAL_SNOUT_TO_HEAD, 1) * idealSnoutToHeadModifier, 2);
    const biteForcePercent = idealHeadHeightToHeadLength + idealSnoutHeightToSnoutLength + idealSnoutToHead;
    const headMass = round(getDiffFromIdeal((headHeight * headLength + snoutHeight * snoutLength) / totalMass, IDEAL_HEAD_MASS_TO_TOTAL_MASS, 2) * headMassModifier, 2);

    const final = round((biteForcePercent * headMass) * finalModifier);
    let stats = {
        idealHeadHeightToHeadLength,
        idealSnoutHeightToSnoutLength,
        idealSnoutToHead,
        headMass,
        biteForce: final
    }
    return {final, stats};
}


function getTopSpeed(weight, legLength, legWidth, bodyLength, bodyHeight) {
    const IDEAL_MASS = 100;
    const IDEAL_LEG_LEN = 1.2;
    const IDEAL_LEG_WIDTH = .15;
    const IDEAL_BODY_HEIGHT_TO_LENGTH = .25;

    const idealMassModifier = .5;
    const idealLegLengthModifier = 1;
    const idealLegWidthModifier = 2;
    const idealBodyHeightToLengthModifier = .5;

    const finalModifier = 23;

    const minLevel = 10;


    const idealMassBonus = round(getDiffFromIdeal(weight, IDEAL_MASS, 200) * idealMassModifier, 2);
    const idealLegLengthBonus = round(getDiffFromIdeal((legLength / bodyHeight), IDEAL_LEG_LEN, 2) * idealLegLengthModifier, 2);
    const idealLegWidthBonus = round(getDiffFromIdeal((legWidth / legLength), IDEAL_LEG_WIDTH, 2) * idealLegWidthModifier, 2);
    const idealBodyHeightToLengthBonus = round(getDiffFromIdeal((bodyHeight / bodyLength), IDEAL_BODY_HEIGHT_TO_LENGTH, 2) * idealBodyHeightToLengthModifier, 2);

    let final = round((idealMassBonus + idealLegLengthBonus + idealLegWidthBonus + idealBodyHeightToLengthBonus) * finalModifier + minLevel);

    final = final > 1 ? final : 1;

    return {
        final,
        idealMassBonus,
        idealLegLengthBonus,
        idealLegWidthBonus,
        idealBodyHeightToLengthBonus
    };
}

function getAcceleration(weight, legLength, legWidth, bodyLength, bodyHeight) {
    // ideal mass
    // ideal leg width
    // ideal leg length
    const IDEAL_MASS = 60;
    const IDEAL_LEG_LEN = 1;
    const IDEAL_LEG_WIDTH = .3;
    const IDEAL_BODY_HEIGHT_TO_LENGTH = .25;

    const idealMassModifier = .5;
    const idealLegLengthModifier = 1;
    const idealLegWidthModifier = 2;
    const idealBodyHeightToLengthModifier = .5;

    const finalModifier = 23;

    const minLevel = 10;

    const idealMassBonus = round(getDiffFromIdeal(weight, IDEAL_MASS, 200) * idealMassModifier, 2);
    const idealLegLengthBonus = round(getDiffFromIdeal((legLength / bodyHeight), IDEAL_LEG_LEN, 1) * idealLegLengthModifier, 2);
    const idealLegWidthBonus = round(getDiffFromIdeal((legWidth / legLength), IDEAL_LEG_WIDTH, 2) * idealLegWidthModifier, 2);
    const idealBodyHeightToLengthBonus = round(getDiffFromIdeal((bodyHeight / bodyLength), IDEAL_BODY_HEIGHT_TO_LENGTH, 2) * idealBodyHeightToLengthModifier, 2);

    let final = round((idealMassBonus + idealLegLengthBonus + idealLegWidthBonus + idealBodyHeightToLengthBonus) * finalModifier + minLevel);
    final = final > 1 ? final : 1;

    return {
        final,
        idealMassBonus,
        idealLegLengthBonus,
        idealLegWidthBonus,
        idealBodyHeightToLengthBonus
    };
}

function getEndurance(weight, legLength, legWidth, bodyLength, bodyHeight) {
    const IDEAL_MASS = 200;
    const IDEAL_LEG_LEN = 1.5;
    const IDEAL_LEG_WIDTH = .1;
    const IDEAL_BODY_HEIGHT_TO_LENGTH = .20;

    const idealMassModifier = .01;
    const idealLegLengthModifier = 2;
    const idealLegWidthModifier = .5;
    const idealBodyHeightToLengthModifier = .1;

    const finalModifier = 27;

    const minLevel = 10;


    const idealMassBonus = round(getDiffFromIdeal(weight, IDEAL_MASS, 200) * idealMassModifier, 2);
    const idealLegLengthBonus = round(getDiffFromIdeal((legLength / bodyHeight), IDEAL_LEG_LEN, 1) * idealLegLengthModifier, 2);
    const idealLegWidthBonus = round(getDiffFromIdeal((legWidth / legLength), IDEAL_LEG_WIDTH, 20) * idealLegWidthModifier, 2);
    const idealBodyHeightToLengthBonus = round(getDiffFromIdeal((bodyHeight / bodyLength), IDEAL_BODY_HEIGHT_TO_LENGTH, 2) * idealBodyHeightToLengthModifier, 2);



    let final = round((idealMassBonus + idealLegLengthBonus + idealLegWidthBonus + idealBodyHeightToLengthBonus) * finalModifier + minLevel);
    final = final > 1 ? final : 1;

    return {
        final,
        idealMassBonus,
        idealLegLengthBonus,
        idealLegWidthBonus,
        idealBodyHeightToLengthBonus
    };
}


export function updateTraits (size) {
    let {
        bodyLength,
        bodyHeight,
        tailLength,
        tailWidth,
        legLength,
        legWidth,
        headLength,
        headHeight,
        neckLength,
        neckHeight,
        snoutLength,
        snoutHeight,
        earLength,
        earWidth
    } = size;

    let traits = {};

    traits.bodyMass = (bodyLength * bodyHeight) + (tailLength * tailWidth);
    traits.headMass = (headHeight * headLength) + (snoutLength * snoutHeight) + (earLength * earWidth) + (neckHeight * neckLength);
    traits.legMass = (legLength * legWidth);
    traits.totalMass = traits.bodyMass + traits.headMass + traits.legMass;
    traits.weight = round(traits.totalMass / 100);
    traits.legThickness = round(legLength / legWidth, 2);
    traits.legStrength = round(traits.legThickness * 10, 2);
    traits.legSpeed = ((legLength) / legWidth);
    traits.speedStats = getTopSpeed(traits.weight, legLength, legWidth, bodyLength, bodyHeight);
    traits.speed = traits.speedStats.final;
    traits.accelerationStats = getAcceleration(traits.weight, legLength, legWidth, bodyLength, bodyHeight);
    traits.acceleration = traits.accelerationStats.final;
    traits.enduranceStats = getEndurance(traits.weight, legLength, legWidth, bodyLength, bodyHeight);
    traits.endurance = traits.enduranceStats.final;

    traits.armStrength = round(legWidth / legLength, 2) * 100;
    let results = getBiteForce(headHeight, headLength, snoutHeight, snoutLength, traits.totalMass);
    traits.stats = results.stats;
    traits.biteForce = results.final;
    traits.neckStrength = round(neckHeight / neckLength, 2) * 100;
    traits.attackStrength = traits.armStrength + traits.neckStrength + traits.biteForce;

    traits.browseMax =  round(legLength + neckLength + headLength + snoutLength);
    traits.browseMin = round(legLength - neckLength + headLength + snoutLength);

    return traits;
}
