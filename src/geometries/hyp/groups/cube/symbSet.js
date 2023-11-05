import {TeleportationSet} from "../../../../core/teleportations/TeleportationSet.js";
import {Group, QUAD_RING} from "./Group.js";


const group = new Group();

const zero = QUAD_RING.zero;
const one = QUAD_RING.one;
const mOne = QUAD_RING.element(-1);
const two = QUAD_RING.element(2);
const sqrt3 = QUAD_RING.element(0, 1);
const mSqrt3 = QUAD_RING.element(0, -1);

const modelHalfCube = 1 / Math.sqrt(3);

function testXp(p) {
    return p.coords.x > modelHalfCube * p.coords.w;
}

// language=GLSL
const glslTestXp = `//
bool testXp(Point p){
    return p.coords.x > ${modelHalfCube} * p.coords.w;
}
`;

function testXn(p) {
    return p.coords.x < -modelHalfCube * p.coords.w;
}

// language=GLSL
const glslTestXn = `//
bool testXn(Point p){
    return p.coords.x < -${modelHalfCube} * p.coords.w;
}
`;

function testYp(p) {
    return p.coords.y > modelHalfCube * p.coords.w;
}

// language=GLSL
const glslTestYp = `//
bool testYp(Point p){
    return p.coords.y > ${modelHalfCube} * p.coords.w;
}
`;

function testYn(p) {
    return p.coords.y < -modelHalfCube * p.coords.w;
}

// language=GLSL
const glslTestYn = `//
bool testYn(Point p){
    return p.coords.y < -${modelHalfCube} * p.coords.w;
}
`;

function testZp(p) {
    return p.coords.z > modelHalfCube * p.coords.w;
}

// language=GLSL
const glslTestZp = `//
bool testZp(Point p){
    return p.coords.z > ${modelHalfCube} * p.coords.w;
}
`;

function testZn(p) {
    return p.coords.z < -modelHalfCube * p.coords.w;
}

// language=GLSL
const glslTestZn = `//
bool testZn(Point p){
    return p.coords.z < -${modelHalfCube} * p.coords.w;
}
`;

const shiftXp = group.element();
const shiftXn = group.element();
const shiftYp = group.element();
const shiftYn = group.element();
const shiftZp = group.element();
const shiftZn = group.element();

shiftXp.matrix.set(
    two, zero, zero, mSqrt3,
    zero, zero, one, zero,
    zero, mOne, zero, zero,
    mSqrt3, zero, zero, two
);
shiftXn.matrix.set(
    two, zero, zero, sqrt3,
    zero, zero, mOne, zero,
    zero, one, zero, zero,
    sqrt3, zero, zero, two
);
shiftYp.matrix.set(
    zero, zero, mOne, zero,
    zero, two, zero, mSqrt3,
    one, zero, zero, zero,
    zero, mSqrt3, zero, two
);
shiftYn.matrix.set(
    zero, zero, one, zero,
    zero, two, zero, sqrt3,
    mOne, zero, zero, zero,
    zero, sqrt3, zero, two
);
shiftZp.matrix.set(
    zero, one, zero, zero,
    mOne, zero, zero, zero,
    zero, zero, two, mSqrt3,
    zero, zero, mSqrt3, two
);
shiftZn.matrix.set(
    zero, mOne, zero, zero,
    one, zero, zero, zero,
    zero, zero, two, sqrt3,
    zero, zero, sqrt3, two
);


export default new TeleportationSet()
    .add(testXp, glslTestXp, shiftXp, shiftXn)
    .add(testXn, glslTestXn, shiftXn, shiftXp)
    .add(testYp, glslTestYp, shiftYp, shiftYn)
    .add(testYn, glslTestYn, shiftYn, shiftYp)
    .add(testZp, glslTestZp, shiftZp, shiftZn)
    .add(testZn, glslTestZn, shiftZn, shiftZp);
