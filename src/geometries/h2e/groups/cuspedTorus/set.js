import {Vector4} from "three";

import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "../../../../commons/groups/isometry/Group.js";
import {Vector} from "../../geometry/General.js";


const group = new Group();

const sqrt2 = Math.sqrt(2);
const modelHalfCube = 1 / sqrt2;

const normalXp = new Vector4(1, 0, -modelHalfCube, 0);

function testXp(p) {
    return p.coords.dot(normalXp) > 0;
}

// language=GLSL
const glslTestXp = `//
bool testXp(Point p){
    vec4 normal = vec4(1, 0, -${modelHalfCube}, 0);
    return dot(p.coords, normal) > 0.;
}
`;

const normalXn = new Vector4(-1, 0, -modelHalfCube, 0);

function testXn(p) {
    return p.coords.dot(normalXn) > 0;
}

// language=GLSL
const glslTestXn = `//
bool testXn(Point p){
    vec4 normal = vec4(-1, 0, -${modelHalfCube}, 0);
    return dot(p.coords, normal) > 0.;
}
`;

const normalYp = new Vector4(0, 1, -modelHalfCube, 0);

function testYp(p) {
    return p.coords.dot(normalYp) > 0;
}

// language=GLSL
const glslTestYp = `//
bool testYp(Point p){
    vec4 normal = vec4(0, 1, -${modelHalfCube}, 0);
    return dot(p.coords, normal) > 0.;
}
`;

const normalYn = new Vector4(0, -1, -modelHalfCube, 0);

function testYn(p) {
    return p.coords.dot(normalYn) > 0;
}

// language=GLSL
const glslTestYn = `//
bool testYn(Point p){
    vec4 normal = vec4(0, -1, -${modelHalfCube}, 0);
    return dot(p.coords, normal) > 0.;
}
`;

function testWp(p) {
    return p.coords.w > 1;
}

// language=GLSL
const glslTestWp = `//
bool testWp(Point p){
    return p.coords.w > 1.;
}
`;

function testWn(p) {
    return p.coords.w < -1.;
}

// language=GLSL
const glslTestWn = `//
bool testWn(Point p){
    return p.coords.w < -1.;
}
`;

const shiftXp = group.element();
const shiftXn = group.element();
const shiftYp = group.element();
const shiftYn = group.element();
const shiftWp = group.element();
const shiftWn = group.element();

const c = 2 * sqrt2;
shiftXp.isom.matrix.set(
    3, 0, -c, 0,
    0, 1, 0, 0,
    -c, 0, 3, 0,
    0, 0, 0, 1
);
shiftXn.isom.matrix.set(
    3, 0, c, 0,
    0, 1, 0, 0,
    c, 0, 3, 0,
    0, 0, 0, 1
);
shiftYp.isom.matrix.set(
    1, 0, 0, 0,
    0, 3, -c, 0,
    0, -c, 3, 0,
    0, 0, 0, 1
);
shiftYn.isom.matrix.set(
    1, 0, 0, 0,
    0, 3, c, 0,
    0, c, 3, 0,
    0, 0, 0, 1
);
shiftWp.isom.makeTranslationFromDir(new Vector(0, 0, -2));
shiftWn.isom.makeTranslationFromDir(new Vector(0, 0, 2));

export default new TeleportationSet()
    .add(testXp, glslTestXp, shiftXp, shiftXn)
    .add(testXn, glslTestXn, shiftXn, shiftXp)
    .add(testYp, glslTestYp, shiftYp, shiftYn)
    .add(testYn, glslTestYn, shiftYn, shiftYp)
    .add(testWp, glslTestWp, shiftWp, shiftWn)
    .add(testWn, glslTestWn, shiftWn, shiftWp);



