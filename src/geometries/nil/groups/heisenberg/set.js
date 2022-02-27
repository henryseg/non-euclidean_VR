import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "./Group.js";

const group = new Group();

function testXp(p) {
    return p.coords.dot(group.testTranslationA) > 0.5;
}

// language=GLSL
const glslTestXp = `//
bool testXp(Point p){
    return dot(p.coords, group.testTranslationA) > 0.5;
}
`;

// // language=GLSL
// const glslCreepXp = `//
// ExtVector creepXp(ExtVector v, float offset){
//     Vector local = v.vector.local;
//     vec4 uAux = group.dotMatrix * group.translationA;
//     float t = (0.5 - dot(local.pos.coords.xy, uAux.xy)) / length(uAux.xy) + offset;
//     return flow(v, t);
// }
// `;


function testXn(p) {
    return p.coords.dot(group.testTranslationA) < -0.5;
}

// language=GLSL
const glslTestXn = `//
bool testXn(Point p){
    return dot(p.coords, group.testTranslationA) < -0.5;
}
`;


function testYp(p) {
    return p.coords.dot(group.testTranslationB) > 0.5;
}

// language=GLSL
const glslTestYp = `//
bool testYp(Point p){
    return dot(p.coords, group.testTranslationB) > 0.5;
}
`;


function testYn(p) {
    return p.coords.dot(group.testTranslationB) < -0.5;
}

// language=GLSL
const glslTestYn = `//
bool testYn(Point p){
    return dot(p.coords, group.testTranslationB) < -0.5;
}
`;


function testZp(p) {
    return p.coords.dot(group.testTranslationC) > 0.5;
}

// language=GLSL
const glslTestZp = `//
bool testZp(Point p){
    return dot(p.coords, group.testTranslationC) > 0.5;
}
`;


function testZn(p) {
    return p.coords.dot(group.testTranslationC) < -0.5;
}

// language=GLSL
const glslTestZn = `//
bool testZn(Point p){
    return dot(p.coords, group.testTranslationC) < -0.5;
}
`;


const shiftXp = group.element(-1, 0, 0);
const shiftXn = group.element(1, 0, 0);
const shiftYp = group.element(0, -1, 0);
const shiftYn = group.element(0, 1, 0);
const shiftZp = group.element(0, 0, -1);
const shiftZn = group.element(0, 0, 1);


const neighborsLite = [
    {elt: shiftXp, inv: shiftXn},
    {elt: shiftXn, inv: shiftXp},
    {elt: shiftYp, inv: shiftYn},
    {elt: shiftYn, inv: shiftYp},
    {elt: shiftZp, inv: shiftZn},
    {elt: shiftZn, inv: shiftZp}
];

/**
 * Subgroup corresponding to the integer Heisenberg group
 */
export default new TeleportationSet(neighborsLite)
    .add(testXp, glslTestXp, shiftXp, shiftXn)
    .add(testXn, glslTestXn, shiftXn, shiftXp)
    .add(testYp, glslTestYp, shiftYp, shiftYn)
    .add(testYn, glslTestYn, shiftYn, shiftYp)
    .add(testZp, glslTestZp, shiftZp, shiftZn)
    .add(testZn, glslTestZn, shiftZn, shiftZp);





