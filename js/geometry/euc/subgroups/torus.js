import {
    Point,
    Isometry,
    Teleport,
    Subgroup
} from "../General.js";


const cubeHalfWidth = 0.5;

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

const shiftXp = new Isometry().makeTranslation(new Point(-2 * cubeHalfWidth, 0, 0));
const shiftXn = new Isometry().makeTranslation(new Point(2 * cubeHalfWidth, 0, 0));
const shiftYp = new Isometry().makeTranslation(new Point(0, -2 * cubeHalfWidth, 0));
const shiftYn = new Isometry().makeTranslation(new Point(0, 2 * cubeHalfWidth, 0));
const shiftZp = new Isometry().makeTranslation(new Point(0, 0, -2 * cubeHalfWidth));
const shiftZn = new Isometry().makeTranslation(new Point(0, 0, 2 * cubeHalfWidth));

const teleportXp = new Teleport(testXp, shiftXp, shiftXn);
const teleportXn = new Teleport(testXn, shiftXn, shiftXp);
const teleportYp = new Teleport(testYp, shiftYp, shiftYn);
const teleportYn = new Teleport(testYn, shiftYn, shiftYp);
const teleportZp = new Teleport(testZp, shiftZp, shiftZn);
const teleportZn = new Teleport(testZn, shiftZn, shiftZp);

const torus = new Subgroup([
    teleportXp,
    teleportXn,
    teleportYp,
    teleportYn,
    teleportZp,
    teleportZn
], "/shaders/geometry/euc/subgroups/torus.xml");

export {
    torus
}
