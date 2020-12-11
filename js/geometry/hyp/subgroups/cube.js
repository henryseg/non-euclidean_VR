import {
    Point,
    Isometry,
    Teleport,
    Subgroup
} from "../General.js";

import {
    Vector3
} from "../../../lib/three.module.js"

const cubeHalfWidth = 0.57735026;

function testXp(p) {
    return p.coords.x > cubeHalfWidth;
}

function testXn(p) {
    return p.coords.x < -cubeHalfWidth;
}

function testYp(p) {
    return p.coords.y > cubeHalfWidth;
}

function testYn(p) {
    return p.coords.y < -cubeHalfWidth;
}

function testZp(p) {
    return p.coords.z > cubeHalfWidth;
}

function testZn(p) {
    return p.coords.z < -cubeHalfWidth;
}

const shiftXp = new Isometry().makeTranslationFromDir(new Vector3(-2 * cubeHalfWidth, 0, 0));
const shiftXn = new Isometry().makeTranslationFromDir(new Vector3(2 * cubeHalfWidth, 0, 0));
const shiftYp = new Isometry().makeTranslationFromDir(new Vector3(0, -2 * cubeHalfWidth, 0));
const shiftYn = new Isometry().makeTranslationFromDir(new Vector3(0, 2 * cubeHalfWidth, 0));
const shiftZp = new Isometry().makeTranslationFromDir(new Vector3(0, 0, -2 * cubeHalfWidth));
const shiftZn = new Isometry().makeTranslationFromDir(new Vector3(0, 0, 2 * cubeHalfWidth));

const teleportXp = new Teleport(testXp, shiftXp, shiftXn);
const teleportXn = new Teleport(testXn, shiftXn, shiftXp);
const teleportYp = new Teleport(testYp, shiftYp, shiftYn);
const teleportYn = new Teleport(testYn, shiftYn, shiftYp);
const teleportZp = new Teleport(testZp, shiftZp, shiftZn);
const teleportZn = new Teleport(testZn, shiftZn, shiftZp);

const cube = new Subgroup([
    teleportXp,
    teleportXn,
    teleportYp,
    teleportYn,
    teleportZp,
    teleportZn
], "shaders/subgroups/hyp/cube.xml");

export {
    cube
}
