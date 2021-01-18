import {Group} from "./Group.js";
import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Teleportation} from "../../../../core/groups/Teleportation.js";


const group = new Group();

function testXp(p) {
    const aux = group.halfTranslationA.clone().applyMatrix4(group.dotMatrix);
    return p.coords.dot(aux) > 1;
}

// language=GLSL
const glslTestXp = `//
bool testXp(Point p){
    return dot(p.coords, group.dotMatrix * group.halfTranslationA) > 1.;
}
`;
// language=GLSL
const glslCreepXp = `//
ExtVector creepXp(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 uAux = group.dotMatrix * group.halfTranslationA;
    float aux0 = 1. - dot(local.pos.coords, uAux);
    float aux1 = dot(local.dir, uAux);
    float t = aux0 / aux1 + offset;
    return flow(v, t);
}
`;

function testXn(p) {
    const aux = group.halfTranslationA.clone().applyMatrix4(group.dotMatrix);
    return p.coords.dot(aux) < -1;
}

// language=GLSL
const glslTestXn = `//
bool testXn(Point p){
    return dot(p.coords, group.dotMatrix * group.halfTranslationA) < -1.;
}
`;
// language=GLSL
const glslCreepXn = `//
ExtVector creepXn(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 uAux = group.dotMatrix * group.halfTranslationA;
    float aux0 = 1. + dot(local.pos.coords, uAux);
    float aux1 = -dot(local.dir, uAux);
    float t = aux0 / aux1 + offset;
    return flow(v, t);
}
`;

function testYp(p) {
    const aux = group.halfTranslationB.clone().applyMatrix4(group.dotMatrix);
    return p.coords.dot(aux) > 1;
}

// language=GLSL
const glslTestYp = `//
bool testYp(Point p){
    return dot(p.coords, group.dotMatrix * group.halfTranslationB) > 1.;
}
`;
// language=GLSL
const glslCreepYp = `//
ExtVector creepYp(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 uAux = group.dotMatrix * group.halfTranslationB;
    float aux0 = 1. - dot(local.pos.coords, uAux);
    float aux1 = dot(local.dir, uAux);
    float t = aux0 / aux1 + offset;
    return flow(v, t);
}
`;

function testYn(p) {
    const aux = group.halfTranslationB.clone().applyMatrix4(group.dotMatrix);
    return p.coords.dot(aux) < -1;
}

// language=GLSL
const glslTestYn = `//
bool testYn(Point p){
    return dot(p.coords, group.dotMatrix * group.halfTranslationB) < -1.;
}
`;
// language=GLSL
const glslCreepYn = `//
ExtVector creepYn(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 uAux = group.dotMatrix * group.halfTranslationB;
    float aux0 = 1. + dot(local.pos.coords, uAux);
    float aux1 = -dot(local.dir, uAux);
    float t = aux0 / aux1 + offset;
    return flow(v, t);
}
`;

function testZp(p) {
    const aux = group.halfTranslationC.clone().applyMatrix4(group.dotMatrix);
    return p.coords.dot(aux) > 1;
}

// language=GLSL
const glslTestZp = `//
bool testZp(Point p){
    return dot(p.coords, group.dotMatrix * group.halfTranslationC) > 1.;
}
`;
// language=GLSL
const glslCreepZp = `//
ExtVector creepZp(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 uAux = group.dotMatrix * group.halfTranslationC;
    float aux0 = 1. - dot(local.pos.coords, uAux);
    float aux1 = dot(local.dir, uAux);
    float t = aux0 / aux1 + offset;
    return flow(v, t);
}
`;

function testZn(p) {
    const aux = group.halfTranslationC.clone().applyMatrix4(group.dotMatrix);
    return p.coords.dot(aux) < -1;
}

// language=GLSL
const glslTestZn = `//
bool testZn(Point p){
    return dot(p.coords, group.dotMatrix * group.halfTranslationC) < -1.;
}
`;
// language=GLSL
const glslCreepZn = `//
ExtVector creepZn(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 uAux = group.dotMatrix * group.halfTranslationC;
    float aux0 = 1. + dot(local.pos.coords, uAux);
    float aux1 = -dot(local.dir, uAux);
    float t = aux0 / aux1 + offset;
    return flow(v, t);
}
`;


const shiftXp = group.element(-1, 0, 0);
const shiftXn = group.element(1, 0, 0);
const shiftYp = group.element(0, -1, 0);
const shiftYn = group.element(0, 1, 0);
const shiftZp = group.element(0, 0, -1);
const shiftZn = group.element(0, 0, 1);


const teleportXp = new Teleportation(testXp, glslTestXp, shiftXp, shiftXn, glslCreepXp);
const teleportXn = new Teleportation(testXn, glslTestXn, shiftXn, shiftXp, glslCreepXn);
const teleportYp = new Teleportation(testYp, glslTestYp, shiftYp, shiftYn, glslCreepYp);
const teleportYn = new Teleportation(testYn, glslTestYn, shiftYn, shiftYp, glslCreepYn);
const teleportZp = new Teleportation(testZp, glslTestZp, shiftZp, shiftZn, glslCreepZp);
const teleportZn = new Teleportation(testZn, glslTestZn, shiftZn, shiftZp, glslCreepZn);

const teleportations = [
    teleportXp,
    teleportXn,
    teleportYp,
    teleportYn,
    teleportZp,
    teleportZn
];

const neighborsLite = [
    {elt: shiftXp, inv: shiftXn},
    {elt: shiftXn, inv: shiftXp},
    {elt: shiftYp, inv: shiftYn},
    {elt: shiftYn, inv: shiftYp},
    {elt: shiftZp, inv: shiftZn},
    {elt: shiftZn, inv: shiftZp}
];

const neighborsFull = [
    {elt: shiftXp, inv: shiftXn},
    {elt: shiftXn, inv: shiftXp},
    {elt: shiftYp, inv: shiftYn},
    {elt: shiftYn, inv: shiftYp},
    {elt: shiftZp, inv: shiftZn},
    {elt: shiftZn, inv: shiftZp},

    {elt: shiftXp.clone().multiply(shiftYp), inv: shiftYn.clone().multiply(shiftXn)},
    {elt: shiftXp.clone().multiply(shiftYn), inv: shiftYp.clone().multiply(shiftXn)},
    {elt: shiftXn.clone().multiply(shiftYp), inv: shiftYn.clone().multiply(shiftXp)},
    {elt: shiftXn.clone().multiply(shiftYn), inv: shiftYp.clone().multiply(shiftXp)},

    {elt: shiftXp.clone().multiply(shiftZp), inv: shiftZn.clone().multiply(shiftXn)},
    {elt: shiftXp.clone().multiply(shiftZn), inv: shiftZp.clone().multiply(shiftXn)},
    {elt: shiftXn.clone().multiply(shiftZp), inv: shiftZn.clone().multiply(shiftXp)},
    {elt: shiftXn.clone().multiply(shiftZn), inv: shiftZp.clone().multiply(shiftXp)},

    {elt: shiftYp.clone().multiply(shiftZp), inv: shiftZn.clone().multiply(shiftYn)},
    {elt: shiftYp.clone().multiply(shiftZn), inv: shiftZp.clone().multiply(shiftYn)},
    {elt: shiftYn.clone().multiply(shiftZp), inv: shiftZn.clone().multiply(shiftYp)},
    {elt: shiftYn.clone().multiply(shiftZn), inv: shiftZp.clone().multiply(shiftYp)},
];

export default new TeleportationSet(teleportations, neighborsLite);
export const fullTorus = new TeleportationSet(teleportations, neighborsFull);