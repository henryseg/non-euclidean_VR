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

// language=GLSL
const glslCreepXp = `//
float creepXp(ExtVector v, float offset){
    vec4 coords = v.vector.local.pos.coords;
    float dist = (0.5 - dot(coords, group.testTranslationA)) / length(group.testTranslationA);
    return dist + offset;
}
`;


function testXn(p) {
    return p.coords.dot(group.testTranslationA) < -0.5;
}

// language=GLSL
const glslTestXn = `//
bool testXn(Point p){
    return dot(p.coords, group.testTranslationA) < -0.5;
}
`;

// language=GLSL
const glslCreepXn = `//
float creepXn(ExtVector v, float offset){
    vec4 coords = v.vector.local.pos.coords;
    float dist = (0.5 + dot(coords, group.testTranslationA)) / length(group.testTranslationA);
    return dist + offset;
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

// language=GLSL
const glslCreepYp = `//
float creepYp(ExtVector v, float offset){
    vec4 coords = v.vector.local.pos.coords;
    float dist = (0.5 - dot(coords, group.testTranslationB)) / length(group.testTranslationB);
    return dist + offset;
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

// language=GLSL
const glslCreepYn = `//
float creepYn(ExtVector v, float offset){
    vec4 coords = v.vector.local.pos.coords;
    float dist = (0.5 + dot(coords, group.testTranslationB)) / length(group.testTranslationB);
    return dist + offset;
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
    .add(testXp, glslTestXp, shiftXp, shiftXn, glslCreepXp)
    .add(testXn, glslTestXn, shiftXn, shiftXp, glslCreepXn)
    .add(testYp, glslTestYp, shiftYp, shiftYn, glslCreepYp)
    .add(testYn, glslTestYn, shiftYn, shiftYp, glslCreepYn)
    .add(testZp, glslTestZp, shiftZp, shiftZn)
    .add(testZn, glslTestZn, shiftZn, shiftZp);





