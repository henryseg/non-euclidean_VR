import {Group} from "./Group.js";
import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";


const group = new Group();

function testXp(p) {
    return p.coords.x > group.halfWidth;
}

// language=GLSL
const glslTestXp = `//
bool testXp(Point p){
    return p.coords.x > group.halfWidth;
}
`;

function testXn(p) {
    return p.coords.x < -group.halfWidth;
}

// language=GLSL
const glslTestXn = `//
bool testXn(Point p){
    return p.coords.x < -group.halfWidth;
}
`;

function testYp(p) {
    return p.coords.y > group.halfWidth;
}

// language=GLSL
const glslTestYp = `//
bool testYp(Point p){
    return p.coords.y > group.halfWidth;
}
`;

function testYn(p) {
    return p.coords.y < -group.halfWidth;
}

// language=GLSL
const glslTestYn = `//
bool testYn(Point p){
    return p.coords.y < -group.halfWidth;
}
`;

function testZp(p) {
    return p.coords.z > group.halfWidth;
}

// language=GLSL
const glslTestZp = `//
bool testZp(Point p){
    return p.coords.z > group.halfWidth;
}
`;

function testZn(p) {
    return p.coords.z < -group.halfWidth;
}

// language=GLSL
const glslTestZn = `//
bool testZn(Point p){
    return p.coords.z < -group.halfWidth;
}
`;

const shiftXp = group.element(-1, 0, 0);
const shiftXn = group.element(1, 0, 0);
const shiftYp = group.element(0, -1, 0);
const shiftYn = group.element(0, 1, 0);
const shiftZp = group.element(0, 0, -1);
const shiftZn = group.element(0, 0, 1);

export default new TeleportationSet()
    .add(testXp, glslTestXp, shiftXp, shiftXn)
    .add(testXn, glslTestXn, shiftXn, shiftXp)
    .add(testYp, glslTestYp, shiftYp, shiftYn)
    .add(testYn, glslTestYn, shiftYn, shiftYp)
    .add(testZp, glslTestZp, shiftZp, shiftZn)
    .add(testZn, glslTestZn, shiftZn, shiftZp);
