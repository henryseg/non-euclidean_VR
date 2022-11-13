import {Vector4} from "three";

import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "./Group.js";

const group = new Group(
    new Vector4(1, 0, 0, 0),
    new Vector4(0, 1, 0, 0)
);

function testAp(p) {
    const aux = group.dirA.clone().applyMatrix4(group.dotMatrix);
    return p.coords.dot(aux) > 1;
}

// language=GLSL
const glslTestAp = `//
bool testAp(Point p){
    return dot(p.coords, group.dotMatrix * group.dirA) > 0.5;
}
`;

function testAn(p) {
    const aux = group.dirA.clone().applyMatrix4(group.dotMatrix)
    return p.coords.dot(aux) < -1;
}

// language=GLSL
const glslTestAn = `//
bool testAn(Point p){
    return dot(p.coords, group.dotMatrix * group.dirA) < -0.5;
}
`;

function testBp(p) {
    const aux = group.dirB.clone().applyMatrix4(group.dotMatrix)
    return p.coords.dot(aux) > 1;
}

// language=GLSL
const glslTestBp = `//
bool testBp(Point p){
    return dot(p.coords, group.dotMatrix * group.dirB) > 0.5;
}
`;

function testYn(p) {
    const aux = group.dirB.clone().applyMatrix4(group.dotMatrix)
    return p.coords.dot(aux) < -1;
}

// language=GLSL
const glslTestBn = `//
bool testBn(Point p){
    return dot(p.coords, group.dotMatrix * group.dirB) < -0.5;
}
`;

const shiftAp = group.element(-1, 0);
const shiftAn = group.element(1, 0);
const shiftBp = group.element(0, -1);
const shiftBn = group.element(0, 1);


export default new TeleportationSet()
    .add(testAp, glslTestAp, shiftAp, shiftAn)
    .add(testAn, glslTestAn, shiftAn, shiftAp)
    .add(testBp, glslTestBp, shiftBp, shiftBn)
    .add(testYn, glslTestBn, shiftBn, shiftBp);

