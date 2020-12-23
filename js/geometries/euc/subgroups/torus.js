import {
    Point,
    Isometry,
    Teleport,
    Subgroup
} from "../geometry/General.js";


const cubeHalfWidth = 0.8;

function testXp(p) {
    return p.coords.x > cubeHalfWidth;
}

// language=GLSL
const glslTestXp = `//
bool testXp(Point p){
    return p.coords.x > ${cubeHalfWidth};
}
`;

function testXn(p) {
    return p.coords.x < -cubeHalfWidth;
}

// language=GLSL
const glslTestXn = `//
bool testXn(Point p){
    return p.coords.x < -${cubeHalfWidth};
}
`;

function testYp(p) {
    return p.coords.y > cubeHalfWidth;
}

// language=GLSL
const glslTestYp = `//
bool testYp(Point p){
    return p.coords.y > ${cubeHalfWidth};
}
`;

function testYn(p) {
    return p.coords.y < -cubeHalfWidth;
}

// language=GLSL
const glslTestYn = `//
bool testYn(Point p){
    return p.coords.y < -${cubeHalfWidth};
}
`;

function testZp(p) {
    return p.coords.z > cubeHalfWidth;
}

// language=GLSL
const glslTestZp = `//
bool testZp(Point p){
    return p.coords.z > ${cubeHalfWidth};
}
`;

function testZn(p) {
    return p.coords.z < -cubeHalfWidth;
}

// language=GLSL
const glslTestZn = `//
bool testZn(Point p){
    return p.coords.z < -${cubeHalfWidth};
}
`;

const shiftXp = new Isometry().makeTranslation(new Point(-2 * cubeHalfWidth, 0, 0));
const shiftXn = new Isometry().makeTranslation(new Point(2 * cubeHalfWidth, 0, 0));
const shiftYp = new Isometry().makeTranslation(new Point(0, -2 * cubeHalfWidth, 0));
const shiftYn = new Isometry().makeTranslation(new Point(0, 2 * cubeHalfWidth, 0));
const shiftZp = new Isometry().makeTranslation(new Point(0, 0, -2 * cubeHalfWidth));
const shiftZn = new Isometry().makeTranslation(new Point(0, 0, 2 * cubeHalfWidth));

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
