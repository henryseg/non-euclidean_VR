import {Vector4} from "../../../../lib/three.module.js";
import {GroupElement} from "./GroupElement.js";
import {Teleportation} from "../../../../core/groups/Teleportation.js";
import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import element from "./shaders/element.js";


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


const shiftXp = new GroupElement(1, 0, 0, 0);
console.log("Quat X", shiftXp.toIsometry().matrix.toLog());
const shiftXn = new GroupElement(-1, 0, 0, 0);
// console.log("Quat", shiftXn.toIsometry().matrix.toLog());
const shiftYp = new GroupElement(0, 1, 0, 0);
console.log("Quat Y", shiftYp.toIsometry().matrix.toLog());
const shiftYn = new GroupElement(0, -1, 0, 0);
// console.log("Quat", shiftYn.toIsometry().matrix.toLog());
const shiftZp = new GroupElement(0, 0, -1, 0);
console.log("Quat Z", shiftZp.toIsometry().matrix.toLog());
const shiftZn = new GroupElement(0, 0, 1, 0);
// console.log("Quat", shiftZn.toIsometry().matrix.toLog());

const teleportXp = new Teleportation(testXp, glslTestXp, shiftXp, shiftXn);
const teleportXn = new Teleportation(testXn, glslTestXn, shiftXn, shiftXp);
const teleportYp = new Teleportation(testYp, glslTestYp, shiftYp, shiftYn);
const teleportYn = new Teleportation(testYn, glslTestYn, shiftYn, shiftYp);
const teleportZp = new Teleportation(testZp, glslTestZp, shiftZp, shiftZn);
const teleportZn = new Teleportation(testZn, glslTestZn, shiftZn, shiftZp);

export default new TeleportationSet([
        teleportXp,
        teleportXn,
        teleportYp,
        teleportYn,
        teleportZp,
        teleportZn
    ],
    element);