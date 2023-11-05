import {Vector4} from "three";

import {TeleportationSet} from "../../../../core/teleportations/TeleportationSet.js";
import {Group, PHI} from "./Group.js";


const group = new Group();

const normalX = new Vector4(PHI, -1, 0, 0);
const normalY = new Vector4(1, PHI, 0, 0);

function testXp(p) {
    return p.coords.dot(normalX) > 0.5;
}

// language=GLSL
const glslTestXp = `//
bool testXp(Point p){
    vec4 normal = vec4(${PHI}, -1, 0, 0);
    return dot(p.coords, normal) > 0.5;
}
`;

function testXn(p) {
    return p.coords.dot(normalX) < -0.5;
}

// language=GLSL
const glslTestXn = `//
bool testXn(Point p){
    vec4 normal = vec4(${PHI}, -1, 0, 0);
    return dot(p.coords, normal) < -0.5;
}
`;

function testYp(p) {
    return p.coords.dot(normalY) > 0.5;
}

// language=GLSL
const glslTestYp = `//
bool testYp(Point p){
    vec4 normal = vec4(1, ${PHI}, 0, 0);
    return dot(p.coords, normal) > 0.5;
}
`;

function testYn(p) {
    return p.coords.dot(normalY) < -0.5;
}

// language=GLSL
const glslTestYn = `//
bool testYn(Point p){
    vec4 normal = vec4(1, ${PHI}, 0, 0);
    return dot(p.coords, normal) < -0.5;
}
`;


const shiftXp = group.element(-1, 0);
const shiftXn = group.element(1, 0);
const shiftYp = group.element(0, -1);
const shiftYn = group.element(0, 1);


export default new TeleportationSet()
    .add(testXp, glslTestXp, shiftXp, shiftXn)
    .add(testXn, glslTestXn, shiftXn, shiftXp)
    .add(testYp, glslTestYp, shiftYp, shiftYn)
    .add(testYn, glslTestYn, shiftYn, shiftYp)
