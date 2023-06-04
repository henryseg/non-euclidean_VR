import {Vector4} from "three";

import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "./Group.js";

// Major problem : the set {z = 0} is not invariant by the given isometries!!


const sqrt3 = Math.sqrt(3);
const modelHalfCube = 1 / sqrt3;

const group = new Group();

const normalXp = new Vector4(1, 0, 0, -modelHalfCube);

function testXp(p) {
    return p.coords.dot(normalXp) > 0;
}

// language=GLSL
const glslTestXp = `//
bool testXp(Point p){
    vec4 normal = vec4(1, 0, 0, -${modelHalfCube});
    return dot(p.coords, normal) > 0.;
}
`;

// language=GLSL
const glslCreepXp = `//
float creepXp(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(1, 0, 0, -${modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    return atanh(aux) + offset;
}
`;

const normalXn = new Vector4(-1, 0, 0, -modelHalfCube);

function testXn(p) {
    return p.coords.dot(normalXn) > 0;
}

// language=GLSL
const glslTestXn = `//
bool testXn(Point p){
    vec4 normal = vec4(-1, 0, 0, -${modelHalfCube});
    return dot(p.coords, normal) > 0.;
}
`;

// language=GLSL
const glslCreepXn = `//
float creepXn(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(-1, 0, 0, -${modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    return atanh(aux) + offset;
}
`;

const normalYp = new Vector4(0, 1, 0, -modelHalfCube);

function testYp(p) {
    return p.coords.dot(normalYp) > 0;
}

// language=GLSL
const glslTestYp = `//
bool testYp(Point p){
    vec4 normal = vec4(0, 1, 0, -${modelHalfCube});
    return dot(p.coords, normal) > 0.;
}
`;

// language=GLSL
const glslCreepYp = `//
float creepYp(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(0, 1, 0, -${modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    return atanh(aux) + offset;
}
`;

const normalYn = new Vector4(0, -1, 0, -modelHalfCube);

function testYn(p) {
    return p.coords.dot(normalYn) > 0;
}

// language=GLSL
const glslTestYn = `//
bool testYn(Point p){
    vec4 normal = vec4(0, -1, 0, -${modelHalfCube});
    return dot(p.coords, normal) > 0.;
}
`;

// language=GLSL
const glslCreepYn = `//
float creepYn(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(0, -1, 0, -${modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    return atanh(aux) + offset;
}
`;



const shiftXp = group.element();
const shiftXn = group.element();
const shiftYp = group.element();
const shiftYn = group.element();

shiftXp.isom.matrix.set(
    2, 0, 0, -sqrt3,
    0, 0, 1, 0,
    0, -1, 0, 0,
    -sqrt3, 0, 0, 2
);
shiftXp.finitePart.set(0, -1);
shiftXn.isom.matrix.set(
    2, 0, 0, sqrt3,
    0, 0, -1, 0,
    0, 1, 0, 0,
    sqrt3, 0, 0, 2
)
shiftXn.finitePart.set(0, -1);

shiftYp.isom.matrix.set(
    0, 0, -1, 0,
    0, 2, 0, -sqrt3,
    1, 0, 0, 0,
    0, -sqrt3, 0, 2
);
shiftYp.finitePart.set(1, -1);

shiftYn.isom.matrix.set(
    0, 0, 1, 0,
    0, 2, 0, sqrt3,
    -1, 0, 0, 0,
    0, sqrt3, 0, 2
);
shiftYn.finitePart.set(1, -1);


const neighbors = [
    {elt: shiftXp, inv: shiftXn},
    {elt: shiftXn, inv: shiftXp},
    {elt: shiftYp, inv: shiftYn},
    {elt: shiftYn, inv: shiftYp}
];

export default new TeleportationSet(neighbors)
    .add(testXp, glslTestXp, shiftXp, shiftXn, glslCreepXp)
    .add(testXn, glslTestXn, shiftXn, shiftXp, glslCreepXn)
    .add(testYp, glslTestYp, shiftYp, shiftYn, glslCreepYp)
    .add(testYn, glslTestYn, shiftYn, shiftYp, glslCreepYn);





