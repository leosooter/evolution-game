// const MIN_LEG_SUPPORT_TO_TOTAL_MASS = .4;
// const MIN_BODY_HEIGHT_TO_BODY_LENGTH = .15;
// const MAX_BODY_HEIGHT_TO_BODY_LENGTH = 1.5;
// const MIN_BODY_MASS_TO_TOTAL_MASS = .6;
// const MIN_HEAD_SIZE_TO_TOTAL_MASS = .03;

// const MIN_LEG_SUPPORT_TO_TOTAL_WEIGHT = .3;
// const MIN_BODY_HEIGHT_TO_BODY_LENGTH = .33;
// const MAX_BODY_HEIGHT_TO_BODY_LENGTH = 1.5;
// const MIN_BODY_MASS_TO_TOTAL_MASS = .6;
// const MIN_HEAD_SIZE_TO_TOTAL_MASS = .05;
// const MAX_HEAD_SIZE_TO_TOTAL_MASS = .5;
// const MIN_NECK_HEIGHT_TO_HEAD_HEIGHT = .6;
// const MAX_SNOUT_HEIGHT_TO_HEAD_HEIGHT = .9;
// const MIN_SNOUT_HEIGHT_TO_HEAD_HEIGHT = .25;

const survivalRules = [
    {
        name: "body mass to total mass",
        measure: (size, traits) => (traits.bodyMass / traits.totalMass),
        min: .6,
        max: .95
    },
    {
        name: "head mass to total mass",
        measure: (size, traits) => (traits.headMass / traits.totalMass),
        min: .1,
        max: .6
    },
    {
        name: "leg support to weight",
        measure: (size, traits) => (traits.legStrength / traits.weight),
        min: 1,
        max: 1.9
    },
    {
        name: "body height to length",
        measure: (size) => (size.bodyHeight / size.bodyLength),
        min: .33,
        max: 1.5
    },
    {
        name: "snout height to head height",
        measure: (size) => (size.snoutHeight / size.headHeight),
        min: .25,
        max: .9
    },
    {
        name: "neck height to head height",
        measure: (size) => (size.neckHeight / size.headHeight),
        min: .6,
        max: 1.2
    },
    {
        name: "tail height to body height",
        measure: (size) => (size.neckHeight / size.bodyHeight),
        min: .06,
        max: .25
    },
];

export function canSurvive (base) {

    for (const rule of survivalRules) {
        let measure = rule.measure(base.size, base.traits);

        if (rule.name === "leg support to weight") {
            console.log('measeure', measure);
            console.log('legStrength', base.traits.legStrength, 'weight', base.traits.weight);


        }

        if(rule.min && measure < rule.min) {
            console.log(`Animal failed min ${rule.name}`);
            console.log(`Measure = ${measure} || Min = ${rule.min}`);

            return false;
        }
        if(rule.max && measure > rule.max) {
            console.log(`Animal failed max ${rule.name}`);
            console.log(`Measure = ${measure} || Max = ${rule.max}`);

            return false
        }
    }

    return true;
}
