import {Vector4} from "../../../../lib/three.module.js";

import {Teleportation} from "../../../../core/groups/Teleportation.js";
import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "../../../../commons/groups/isometry/Group.js";
import {Vector} from "../../geometry/General.js";


const group = new Group();

const sqrt2 = Math.sqrt(2);
const aux = Math.pow(2, 0.25);
const shB = 1 / aux;
const chB = Math.sqrt(1 + sqrt2) / aux;
const height = Math.asinh(shB);

const normalXp = new Vector4(chB, 0, -shB, 0);

function testXp(p) {
    return p.coords.dot(normalXp) > 0;
}

// language=GLSL
const glslTestXp = `//
bool testXp(Point p){
    vec4 normal = vec4(${chB}, 0, -${shB}, 0);
    return dot(p.coords, normal) > 0.;
}
`;

const normalXn = new Vector4(-chB, 0, -shB, 0);

function testXn(p) {
    return p.coords.dot(normalXn) > 0;
}

// language=GLSL
const glslTestXn = `//
bool testXn(Point p){
    vec4 normal = vec4(-${chB}, 0, -${shB}, 0);
    return dot(p.coords, normal) > 0.;
}
`;

const normalYp = new Vector4(0, chB, -shB, 0);

function testYp(p) {
    return p.coords.dot(normalYp) > 0;
}

// language=GLSL
const glslTestYp = `//
bool testYp(Point p){
    vec4 normal = vec4(0, ${chB}, -${shB}, 0);
    return dot(p.coords, normal) > 0.;
}
`;

const normalYn = new Vector4(0, -chB, -shB, 0);

function testYn(p) {
    return p.coords.dot(normalYn) > 0;
}

// language=GLSL
const glslTestYn = `//
bool testYn(Point p){
    vec4 normal = vec4(0, -${chB}, -${shB}, 0);
    return dot(p.coords, normal) > 0.;
}
`;

function testWp(p) {
    return p.coords.w > height;
}


const shiftXp = group.element();
const shiftXn = group.element();
const shiftYp = group.element();
const shiftYn = group.element();

const sh2b = 2 * shB * chB;
const ch2B = 2 * chB * chB - 1;

shiftXp.isom.matrix.set(
    ch2B, 0, -sh2b, 0,
    0, 1, 0, 0,
    -sh2b, 0, ch2B, 0,
    0, 0, 0, 1
);
shiftXn.isom.matrix.set(
    ch2B, 0, sh2b, 0,
    0, 1, 0, 0,
    sh2b, 0, ch2B, 0,
    0, 0, 0, 1
);
shiftYp.isom.matrix.set(
    1, 0, 0, 0,
    0, ch2B, -sh2b, 0,
    0, -sh2b, ch2B, 0,
    0, 0, 0, 1
);
shiftYn.isom.matrix.set(
    1, 0, 0, 0,
    0, ch2B, sh2b, 0,
    0, sh2b, ch2B, 0,
    0, 0, 0, 1
);

export default new TeleportationSet()
    .add(testXp, glslTestXp, shiftXp, shiftXn)
    .add(testXn, glslTestXn, shiftXn, shiftXp)
    .add(testYp, glslTestYp, shiftYp, shiftYn)
    .add(testYn, glslTestYn, shiftYn, shiftYp);




