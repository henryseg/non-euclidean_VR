import {Vector4} from "three";
import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "./Group.js";

const group = new Group()

const normalXp = new Vector4(1, 0, 0, -1);
const normalXn = new Vector4(-1, 0, 0, -1);
const normalYp = new Vector4(0, 1, 0, -1);
const normalYn = new Vector4(0, -1, 0, -1);
const normalZp = new Vector4(0, 0, 1, -1);
const normalZn = new Vector4(0, 0, -1, -1);

function testXp(p) {
    return normalXp.dot(p.coords) > 0;
}

// language=GLSL
const glslTestXp = `//
bool testXp(Point p){
    vec4 n = vec4(1, 0, 0, -1);
    return dot(n, p.coords) > 0.;
}
`;

// language=GLSL
const glslCreepXp = `//
float creepXp(ExtVector v, float offset){
    vec4 n = vec4(1, 0, 0, -1);
    vec4 coords = v.vector.local.pos.coords;
    vec4 dir = v.vector.local.dir;
    return -atan(dot(coords, n)/dot(dir, n)) + offset;
}
`;

function testXn(p) {
    return normalXn.dot(p.coords) > 0;
}

// language=GLSL
const glslTestXn = `//
bool testXn(Point p){
    vec4 n = vec4(-1, 0, 0, -1);
    return dot(n, p.coords) > 0.;
}
`;

// language=GLSL
const glslCreepXn = `//
float creepXn(ExtVector v, float offset){
    vec4 n = vec4(-1, 0, 0, -1);
    vec4 coords = v.vector.local.pos.coords;
    vec4 dir = v.vector.local.dir;
    return -atan(dot(coords, n)/dot(dir, n)) + offset;
}
`;

// language=GLSL
function testYp(p) {
    return normalYp.dot(p.coords) > 0;
}

const glslTestYp = `//
bool testYp(Point p){
    vec4 n = vec4(0, 1, 0, -1);
    return dot(n, p.coords) > 0.;
}
`;

// language=GLSL
const glslCreepYp = `//
float creepYp(ExtVector v, float offset){
    vec4 n = vec4(0, 1, 0, -1);
    vec4 coords = v.vector.local.pos.coords;
    vec4 dir = v.vector.local.dir;
    return -atan(dot(coords, n)/dot(dir, n)) + offset;
}
`;

// language=GLSL
function testYn(p) {
    return normalYn.dot(p.coords) > 0;
}

const glslTestYn = `//
bool testYn(Point p){
    vec4 n = vec4(0, -1, 0, -1);
    return dot(n, p.coords) > 0.;
}
`;

// language=GLSL
const glslCreepYn = `//
float creepYn(ExtVector v, float offset){
    vec4 n = vec4(0, -1, 0, -1);
    vec4 coords = v.vector.local.pos.coords;
    vec4 dir = v.vector.local.dir;
    return -atan(dot(coords, n)/dot(dir, n)) + offset;
}
`;


function testZp(p) {
    return normalZp.dot(p.coords) > 0;
}

// language=GLSL
const glslTestZp = `//
bool testZp(Point p){
    vec4 n = vec4(0, 0, 1, -1);
    return dot(n, p.coords) > 0.;
}
`;

// language=GLSL
const glslCreepZp = `//
float creepZp(ExtVector v, float offset){
    vec4 n = vec4(0, 0, 1, -1);
    vec4 coords = v.vector.local.pos.coords;
    vec4 dir = v.vector.local.dir;
    return -atan(dot(coords, n)/dot(dir, n)) + offset;
}
`;

function testZn(p) {
    return normalZn.dot(p.coords) > 0;
}

// language=GLSL
const glslTestZn = `//
bool testZn(Point p){
    vec4 n = vec4(0, 0, -1, -1);
    return dot(n, p.coords) > 0.;
}
`;

// language=GLSL
const glslCreepZn = `//
float creepZn(ExtVector v, float offset){
    vec4 n = vec4(0, 0, -1, -1);
    vec4 coords = v.vector.local.pos.coords;
    vec4 dir = v.vector.local.dir;
    return -atan(dot(coords, n)/dot(dir, n)) + offset;
}
`;


const shiftXp = group.element(1, 0, 0, 0);
const shiftXn = group.element(-1, 0, 0, 0);
const shiftYp = group.element(0, 1, 0, 0);
const shiftYn = group.element(0, -1, 0, 0);
const shiftZp = group.element(0, 0, -1, 0);
const shiftZn = group.element(0, 0, 1, 0);


export default new TeleportationSet()
    .add(testXp, glslTestXp, shiftXp, shiftXn, glslCreepXp)
    .add(testXn, glslTestXn, shiftXn, shiftXp, glslCreepXn)
    .add(testYp, glslTestYp, shiftYp, shiftYn, glslCreepYp)
    .add(testYn, glslTestYn, shiftYn, shiftYp, glslCreepYn)
    .add(testZp, glslTestZp, shiftZp, shiftZn, glslCreepZp)
    .add(testZn, glslTestZn, shiftZn, shiftZp, glslCreepZn);

