import {Isometry, Point, Teleport, Subgroup} from "../../../core/geometry/General.js";

/**
 * Subgroup corresponding to the integer Heisenberg group
 */


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

const shiftXp = new Isometry().makeTranslation(new Point(-1, 0, 0));
const shiftXn = new Isometry().makeTranslation(new Point(1, 0, 0));
const shiftYp = new Isometry().makeTranslation(new Point(0, -1, 0));
const shiftYn = new Isometry().makeTranslation(new Point(0, 1, 0));
const shiftZp = new Isometry().makeTranslation(new Point(0, 0, -1));
const shiftZn = new Isometry().makeTranslation(new Point(0, 0, 1));

const teleportXp = new Teleport(testXp, glslTestXp, shiftXp, shiftXn);
const teleportXn = new Teleport(testXn, glslTestXn, shiftXn, shiftXp);
const teleportYp = new Teleport(testYp, glslTestYp, shiftYp, shiftYn);
const teleportYn = new Teleport(testYn, glslTestYn, shiftYn, shiftYp);
const teleportZp = new Teleport(testZp, glslTestZp, shiftZp, shiftZn);
const teleportZn = new Teleport(testZn, glslTestZn, shiftZn, shiftZp);

export default new Subgroup([
    teleportXp,
    teleportXn,
    teleportYp,
    teleportYn,
    teleportZp,
    teleportZn
]);

