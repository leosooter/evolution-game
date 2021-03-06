import {sample} from "lodash";

export const colorAdjust = {
    r: 0,
    g: 0,
    b: 0
};

export const fallArray = [
    {colorName: "fa1", r: 250, g: 240, b: 80},
    {colorName: "fa2", r: 255, g: 200, b: 80},
    {colorName: "fa3", r: 255, g: 160, b: 80},
    {colorName: "fa4", r: 255, g: 140, b: 80},
];

export const riverArray = [
    {colorName: "rt1", r: 230, g: 245, b: 255},
    {colorName: "rt2", r: 20, g: 200, b: 230},
    {colorName: "rt3", r: 20, g: 200, b: 220},
    {colorName: "rt4", r: 20, g: 200, b: 210},
    {colorName: "rt5", r: 20, g: 205, b: 200},
    {colorName: "rt6", r: 20, g: 210, b: 190}
]



const p1t1 = {colorName: "p1t1", r: 215, g: 210, b: 180};
const p1t2 = {colorName: "p1t2", r: 225, g: 210, b: 170};
const p1t3 = {colorName: "p1t3", r: 235, g: 210, b: 160};
const p1t4 = {colorName: "p1t4", r: 245, g: 210, b: 150};
const p1t5 = {colorName: "p1t5", r: 255, g: 210, b: 140};

const p2t1 = {colorName: "p2t1", r: 210, g: 200, b: 130};
const p2t2 = {colorName: "p2t2", r: 220, g: 210, b: 120};
const p2t3 = {colorName: "p2t3", r: 230, g: 220, b: 110};
const p2t4 = {colorName: "p2t4", r: 240, g: 230, b: 100};
const p2t5 = {colorName: "p2t4", r: 250, g: 240, b: 90};

const p3t1 = {colorName: "p3t1", r: 170, g: 190, b: 90};
const p3t2 = {colorName: "p3t2", r: 180, g: 200, b: 80};
const p3t3 = {colorName: "p3t3", r: 190, g: 210, b: 70};
const p3t4 = {colorName: "p3t4", r: 200, g: 220, b: 60};
const p3t5 = {colorName: "p3t4", r: 210, g: 230, b: 50};

const p4t1 = {colorName: "p4t1", r: 150, g: 210, b: 110};
const p4t2 = {colorName: "p4t2", r: 160, g: 220, b: 100};
const p4t3 = {colorName: "p4t3", r: 185, g: 230, b: 90};
const p4t4 = {colorName: "p4t4", r: 190, g: 240, b: 80};
const p4t5 = {colorName: "p4t1", r: 200, g: 245, b: 70};

const p5t1 = {colorName: "p5t1", r: 90, g: 170, b: 80};
const p5t2 = {colorName: "p5t2", r: 80, g: 175, b: 60};
const p5t3 = {colorName: "p5t3", r: 70, g: 180, b: 40};
const p5t4 = {colorName: "p5t4", r: 60, g: 185, b: 20};
const p5t5 = {colorName: "p5t1", r: 50, g: 190, b: 0};



export const worldColorsGrid = [
    [p1t1, p1t2, p1t3, p1t4, p1t5],
    [p2t1, p2t2, p2t3, p2t4, p2t5],
    [p3t1, p3t2, p3t3, p3t4, p3t5],
    [p4t1, p4t2, p4t3, p4t4, p4t5],
    [p5t1, p5t2, p5t3, p5t4, p5t5]
];

// const p1t1 = {colorName: "p1t1", r: 225, g: 210, b: 180};
// const p1t2 = {colorName: "p1t2", r: 235, g: 210, b: 170};
// const p1t3 = {colorName: "p1t3", r: 245, g: 210, b: 160};
// const p1t4 = {colorName: "p1t4", r: 255, g: 210, b: 150};

// const p2t1 = {colorName: "p2t1", r: 210, g: 200, b: 130};
// const p2t2 = {colorName: "p2t2", r: 220, g: 210, b: 120};
// const p2t3 = {colorName: "p2t3", r: 230, g: 220, b: 110};
// const p2t4 = {colorName: "p2t4", r: 240, g: 230, b: 100};

// const p3t1 = {colorName: "p3t1", r: 170, g: 190, b: 90};
// const p3t2 = {colorName: "p3t2", r: 180, g: 200, b: 80};
// const p3t3 = {colorName: "p3t3", r: 190, g: 210, b: 70};
// const p3t4 = {colorName: "p3t4", r: 200, g: 220, b: 60};

// const p4t1 = {colorName: "p4t1", r: 120, g: 190, b: 120};
// const p4t2 = {colorName: "p4t2", r: 110, g: 195, b: 80};
// const p4t3 = {colorName: "p4t3", r: 90, g: 200, b: 60};
// const p4t4 = {colorName: "p4t4", r: 80, g: 205, b: 20};

// export const worldColorsGrid = [
//     [p1t1, p1t2, p1t3, p1t4],
//     [p2t1, p2t2, p2t3, p2t4],
//     [p3t1, p3t2, p3t3, p3t4],
//     [p4t1, p4t2, p4t3, p4t4]
// ];
