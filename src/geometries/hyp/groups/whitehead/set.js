import {Vector4} from "three";

import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "../../../../commons/groups/isometry/Group.js";


const group = new Group();


const normalU1 = new Vector4(1, 1, 1, -1);

function testU1(p) {
    return p.coords.dot(normalU1) > 0;
}

// language=GLSL
const glslTestU1 = `//
bool testU1(Point p){
    vec4 normal = vec4(1, 1, 1, -1);
    return dot(p.coords, normal) > 0.;
}
`;

const normalU2 = new Vector4(-1, 1, 1, -1);

function testU2(p) {
    return p.coords.dot(normalU2) > 0;
}

// language=GLSL
const glslTestU2 = `//
bool testU2(Point p){
    vec4 normal = vec4(-1, 1, 1, -1);
    return dot(p.coords, normal) > 0.;
}
`;


const normalU3 = new Vector4(-1, -1, 1, -1);

function testU3(p) {
    return p.coords.dot(normalU3) > 0;
}

// language=GLSL
const glslTestU3 = `//
bool testU3(Point p){
    vec4 normal = vec4(-1, -1, 1, -1);
    return dot(p.coords, normal) > 0.;
}
`;


const normalU4 = new Vector4(1, -1, 1, -1);

function testU4(p) {
    return p.coords.dot(normalU4) > 0;
}

// language=GLSL
const glslTestU4 = `//
bool testU4(Point p){
    vec4 normal = vec4(1, -1, 1, -1);
    return dot(p.coords, normal) > 0.;
}
`;


const normalL1 = new Vector4(1, 1, -1, -1);

function testL1(p) {
    return p.coords.dot(normalL1) > 0;
}

// language=GLSL
const glslTestL1 = `//
bool testL1(Point p){
    vec4 normal = vec4(1, 1, -1, -1);
    return dot(p.coords, normal) > 0.;
}
`;

const normalL2 = new Vector4(-1, 1, -1, -1);

function testL2(p) {
    return p.coords.dot(normalL2) > 0;
}

// language=GLSL
const glslTestL2 = `//
bool testL2(Point p){
    vec4 normal = vec4(-1, 1, -1, -1);
    return dot(p.coords, normal) > 0.;
}
`;


const normalL3 = new Vector4(-1, -1, -1, -1);

function testL3(p) {
    return p.coords.dot(normalL3) > 0;
}

// language=GLSL
const glslTestL3 = `//
bool testL3(Point p){
    vec4 normal = vec4(-1, -1, -1, -1);
    return dot(p.coords, normal) > 0.;
}
`;

const normalL4 = new Vector4(1, -1, -1, -1);

function testL4(p) {
    return p.coords.dot(normalL4) > 0;
}

// language=GLSL
const glslTestL4 = `//
bool testL4(Point p){
    vec4 normal = vec4(1, -1, -1, -1);
    return dot(p.coords, normal) > 0.;
}
`;


const L1ToU4 = group.element();
const L2ToU1 = group.element();
const L3ToU2 = group.element();
const L4ToU3 = group.element();


L1ToU4.isom.matrix.set(
    0, -1, 1, 1,
    1, 1, 0, -1,
    -1, 0, 1, 1,
    -1, -1, 1, 2
);

L2ToU1.isom.matrix.set(
    0, -1, 1, 1,
    1, -1, 0, 1,
    1, 0, 1, 1,
    1, -1, 1, 2
);

L3ToU2.isom.matrix.set(
    0, -1, -1, -1,
    1, 1, 0, 1,
    1, 0, 1, 1,
    1, 1, 1, 2
);

L4ToU3.isom.matrix.set(
    0, -1, -1, -1,
    1, -1, 0, -1,
    -1, 0, 1, 1,
    -1, 1, 1, 2
);


const U1ToL2 = group.element();
const U2ToL3 = group.element();
const U3ToL4 = group.element();
const U4ToL1 = group.element();

U1ToL2.isom.copy(L2ToU1.isom).invert();
U2ToL3.isom.copy(L3ToU2.isom).invert();
U3ToL4.isom.copy(L4ToU3.isom).invert();
U4ToL1.isom.copy(L1ToU4.isom).invert();


export default new TeleportationSet()
    .add(testU1, glslTestU1, U1ToL2, L2ToU1)
    .add(testU2, glslTestU2, U2ToL3, L3ToU2)
    .add(testU3, glslTestU3, U3ToL4, L4ToU3)
    .add(testU4, glslTestU4, U4ToL1, L1ToU4)
    .add(testL1, glslTestL1, L1ToU4, U4ToL1)
    .add(testL2, glslTestL2, L2ToU1, U1ToL2)
    .add(testL3, glslTestL3, L3ToU2, U2ToL3)
    .add(testL4, glslTestL4, L4ToU3, U3ToL4);




