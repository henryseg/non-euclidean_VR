import {Vector4} from "../../../../lib/three.module.js";
import {GroupElement} from "./GroupElement.js";
import {Teleportation} from "../../../../core/groups/Teleportation.js";
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
function testYn(p) {
    return normalYn.dot(p.coords) > 0;
}

const glslTestYn = `//
bool testYn(Point p){
    vec4 n = vec4(0, -1, 0, -1);
    return dot(n, p.coords) > 0.;
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


const shiftXp = group.element(1, 0, 0, 0);
const shiftXn = group.element(-1, 0, 0, 0);
const shiftYp = group.element(0, 1, 0, 0);
const shiftYn = group.element(0, -1, 0, 0);
const shiftZp = group.element(0, 0, -1, 0);
const shiftZn = group.element(0, 0, 1, 0);

const teleportXp = new Teleportation(testXp, glslTestXp, shiftXp, shiftXn);
const teleportXn = new Teleportation(testXn, glslTestXn, shiftXn, shiftXp);
const teleportYp = new Teleportation(testYp, glslTestYp, shiftYp, shiftYn);
const teleportYn = new Teleportation(testYn, glslTestYn, shiftYn, shiftYp);
const teleportZp = new Teleportation(testZp, glslTestZp, shiftZp, shiftZn);
const teleportZn = new Teleportation(testZn, glslTestZn, shiftZn, shiftZp);

const teleportations = [
    teleportXp,
    teleportXn,
    teleportYp,
    teleportYn,
    teleportZp,
    teleportZn
];

export default new TeleportationSet(teleportations);