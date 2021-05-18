import {Teleportation} from "../../../../core/groups/Teleportation.js";
import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "../../../../commons/groups/isometry/Group.js";
import {Vector4} from "../../../../lib/three.module.js";


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
ExtVector creepXp(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(1, 0, 0, -${modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    float t = atanh(aux) + offset;
    return flow(v, t);
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
ExtVector creepXn(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(-1, 0, 0, -${modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    float t = atanh(aux) + offset;
    return flow(v, t);
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
ExtVector creepYp(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(0, 1, 0, -${modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    float t = atanh(aux) + offset;
    return flow(v, t);
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
ExtVector creepYn(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(0, -1, 0, -${modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    float t = atanh(aux) + offset;
    return flow(v, t);
}
`;

const normalZp = new Vector4(0, 0, 1, -modelHalfCube);

function testZp(p) {
    return p.coords.dot(normalZp) > 0;
}

// language=GLSL
const glslTestZp = `//
bool testZp(Point p){
    vec4 normal = vec4(0, 0, 1, -${modelHalfCube});
    return dot(p.coords, normal) > 0.;
}
`;

// language=GLSL
const glslCreepZp = `//
ExtVector creepZp(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(0, 0, 1, -${modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    float t = atanh(aux) + offset;
    return flow(v, t);
}
`;

const normalZn = new Vector4(0, 0, -1, -modelHalfCube);

function testZn(p) {
    return p.coords.dot(normalZn) > 0;
}

// language=GLSL
const glslTestZn = `//
bool testZn(Point p){
    vec4 normal = vec4(0, 0, -1, -${modelHalfCube});
    return dot(p.coords, normal) > 0.;
}
`;

// language=GLSL
const glslCreepZn = `//
ExtVector creepZn(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(0, 0, -1, -${modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    float t = atanh(aux) + offset;
    return flow(v, t);
}
`;


const shiftXp = group.element();
const shiftXn = group.element();
const shiftYp = group.element();
const shiftYn = group.element();
const shiftZp = group.element();
const shiftZn = group.element();

shiftXp.isom.matrix.set(
    2, 0, 0, -sqrt3,
    0, 0, 1, 0,
    0, -1, 0, 0,
    -sqrt3, 0, 0, 2
);
shiftXn.isom.matrix.set(
    2, 0, 0, sqrt3,
    0, 0, -1, 0,
    0, 1, 0, 0,
    sqrt3, 0, 0, 2
)

shiftYp.isom.matrix.set(
    0, 0, -1, 0,
    0, 2, 0, -sqrt3,
    1, 0, 0, 0,
    0, -sqrt3, 0, 2
);

shiftYn.isom.matrix.set(
    0, 0, 1, 0,
    0, 2, 0, sqrt3,
    -1, 0, 0, 0,
    0, sqrt3, 0, 2
);

shiftZp.isom.matrix.set(
    0, 1, 0, 0,
    -1, 0, 0, 0,
    0, 0, 2, -sqrt3,
    0, 0, -sqrt3, 2
)

shiftZn.isom.matrix.set(
    0, -1, 0, 0,
    1, 0, 0, 0,
    0, 0, 2, sqrt3,
    0, 0, sqrt3, 2
)

const neighbors = [
    {elt: shiftXp, inv: shiftXn},
    {elt: shiftXn, inv: shiftXp},
    {elt: shiftYp, inv: shiftYn},
    {elt: shiftYn, inv: shiftYp},
    {elt: shiftZp, inv: shiftZn},
    {elt: shiftZn, inv: shiftZp}
];

export default new TeleportationSet(neighbors)
    .add(testXp, glslTestXp, shiftXp, shiftXn, glslCreepXp)
    .add(testXn, glslTestXn, shiftXn, shiftXp, glslCreepXn)
    .add(testYp, glslTestYp, shiftYp, shiftYn, glslCreepYp)
    .add(testYn, glslTestYn, shiftYn, shiftYp, glslCreepYn)
    .add(testZp, glslTestZp, shiftZp, shiftZn, glslCreepZp)
    .add(testZn, glslTestZn, shiftZn, shiftZp, glslCreepZn);





