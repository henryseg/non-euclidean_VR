import {Vector4} from "three";

import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "../../../../commons/groups/isometry/Group.js";
import {PHI, TAU, DENUM} from "./Group.js";
import {Point} from "../../geometry/Point.js";

const group = new Group();

const normalX = new Vector4(PHI, -1, 0, 0);
const normalY = new Vector4(1, PHI, 0, 0);
const normalZ = new Vector4(0, 0, 1 / TAU, 0);

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

function testZp(p) {
    return p.coords.dot(normalZ) > 0.5;
}

// language=GLSL
const glslTestZp = `//
bool testZp(Point p){
    vec4 normal = vec4(0, 0, ${1 / TAU}, 0);
    return dot(p.coords, normal) > 0.5;
}
`;

function testZn(p) {
    return p.coords.dot(normalZ) < -0.5;
}

// language=GLSL
const glslTestZn = `//
bool testZn(Point p){
    vec4 normal = vec4(0, 0, ${1 / TAU}, 0);
    return dot(p.coords, normal) < -0.5;
}
`;

const shiftXp = group.element();
const shiftXn = group.element();
const shiftYp = group.element();
const shiftYn = group.element();
const shiftZp = group.element();
const shiftZn = group.element();

shiftXp.isom.makeTranslation(new Point(-PHI * DENUM, DENUM, 0, 1));
shiftXn.isom.makeTranslation(new Point(PHI * DENUM, -DENUM, 0, 1));
shiftYp.isom.makeTranslation(new Point(-DENUM, -PHI * DENUM, 0, 1));
shiftYn.isom.makeTranslation(new Point(DENUM, PHI * DENUM, 0, 1));
shiftZp.isom.makeTranslation(new Point(0, 0, -TAU, 1));
shiftZn.isom.makeTranslation(new Point(0, 0, TAU, 1));

export default new TeleportationSet()
    .add(testZp, glslTestZp, shiftZp, shiftZn)
    .add(testZn, glslTestZn, shiftZn, shiftZp)
    .add(testXp, glslTestXp, shiftXp, shiftXn)
    .add(testXn, glslTestXn, shiftXn, shiftXp)
    .add(testYp, glslTestYp, shiftYp, shiftYn)
    .add(testYn, glslTestYn, shiftYn, shiftYp);

