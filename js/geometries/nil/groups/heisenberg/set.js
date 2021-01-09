import {Teleportation} from "../../../../core/groups/Teleportation.js";
import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "./Group.js";

const group = new Group();

function testXp(p) {
    return p.coords.x > 0.5;
}

// language=GLSL
const glslTestXp = `//
bool testXp(Point p){
    return p.coords.x > 0.5;
}
`;

function testXn(p) {
    return p.coords.x < -0.5;
}

// language=GLSL
const glslTestXn = `//
bool testXn(Point p){
    return p.coords.x < -0.5;
}
`;

function testYp(p) {
    return p.coords.y > 0.5;
}

// language=GLSL
const glslTestYp = `//
bool testYp(Point p){
    return p.coords.y > 0.5;
}
`;

function testYn(p) {
    return p.coords.y < -0.5;
}

// language=GLSL
const glslTestYn = `//
bool testYn(Point p){
    return p.coords.y < -0.5;
}
`;

function testZp(p) {
    return p.coords.z > 0.5;
}

// language=GLSL
const glslTestZp = `//
bool testZp(Point p){
    return p.coords.z > 0.5;
}
`;

function testZn(p) {
    return p.coords.z < -0.5;
}

// language=GLSL
const glslTestZn = `//
bool testZn(Point p){
    return p.coords.z < -0.5;
}
`;

const shiftXp = group.element(-1, 0, 0);
const shiftXn = group.element(1, 0, 0);
const shiftYp = group.element(0, -1, 0);
const shiftYn = group.element(0, 1, 0);
const shiftZp = group.element(0, 0, -1);
const shiftZn = group.element(0, 0, 1);


const teleportXp = new Teleportation(testXp, glslTestXp, shiftXp, shiftXn);
const teleportXn = new Teleportation(testXn, glslTestXn, shiftXn, shiftXp);
const teleportYp = new Teleportation(testYp, glslTestYp, shiftYp, shiftYn);
const teleportYn = new Teleportation(testYn, glslTestYn, shiftYn, shiftYp);
const teleportZp = new Teleportation(testZp, glslTestZp, shiftZp, shiftZn);
const teleportZn = new Teleportation(testZn, glslTestZn, shiftZn, shiftZp);

const teleportations = [
    teleportXp,
    teleportXn,
    teleportYp,
    teleportYn,
    teleportZp,
    teleportZn
];

/**
 * Subgroup corresponding to the integer Heisenberg group
 */
export default new TeleportationSet(teleportations);

