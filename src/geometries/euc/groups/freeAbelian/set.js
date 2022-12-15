import {Group} from "./Group.js";
import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";


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
float creepXp(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 uAux = group.dotMatrix * group.halfTranslationA;
    float aux0 = 1. - dot(local.pos.coords, uAux);
    float aux1 = dot(local.dir, uAux);
    return aux0 / aux1 + offset;
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
float creepXn(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 uAux = group.dotMatrix * group.halfTranslationA;
    float aux0 = 1. + dot(local.pos.coords, uAux);
    float aux1 = -dot(local.dir, uAux);
    return aux0 / aux1 + offset;
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
float creepYp(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 uAux = group.dotMatrix * group.halfTranslationB;
    float aux0 = 1. - dot(local.pos.coords, uAux);
    float aux1 = dot(local.dir, uAux);
    return aux0 / aux1 + offset;
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
float creepYn(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 uAux = group.dotMatrix * group.halfTranslationB;
    float aux0 = 1. + dot(local.pos.coords, uAux);
    float aux1 = -dot(local.dir, uAux);
    return aux0 / aux1 + offset;
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
float creepZp(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 uAux = group.dotMatrix * group.halfTranslationC;
    float aux0 = 1. - dot(local.pos.coords, uAux);
    float aux1 = dot(local.dir, uAux);
    return aux0 / aux1 + offset;
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
float creepZn(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 uAux = group.dotMatrix * group.halfTranslationC;
    float aux0 = 1. + dot(local.pos.coords, uAux);
    float aux1 = -dot(local.dir, uAux);
    return aux0 / aux1 + offset;
}
`;


const shiftXp = group.element(-1, 0, 0);
const shiftXn = group.element(1, 0, 0);
const shiftYp = group.element(0, -1, 0);
const shiftYn = group.element(0, 1, 0);
const shiftZp = group.element(0, 0, -1);
const shiftZn = group.element(0, 0, 1);


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

const torus = new TeleportationSet(neighborsLite)
    .add(testXp, glslTestXp, shiftXp, shiftXn, glslCreepXp)
    .add(testXn, glslTestXn, shiftXn, shiftXp, glslCreepXn)
    .add(testYp, glslTestYp, shiftYp, shiftYn, glslCreepYp)
    .add(testYn, glslTestYn, shiftYn, shiftYp, glslCreepYn)
    .add(testZp, glslTestZp, shiftZp, shiftZn, glslCreepZp)
    .add(testZn, glslTestZn, shiftZn, shiftZp, glslCreepZn);
const fullTorus = new TeleportationSet(neighborsFull)
    .add(testXp, glslTestXp, shiftXp, shiftXn, glslCreepXp)
    .add(testXn, glslTestXn, shiftXn, shiftXp, glslCreepXn)
    .add(testYp, glslTestYp, shiftYp, shiftYn, glslCreepYp)
    .add(testYn, glslTestYn, shiftYn, shiftYp, glslCreepYn)
    .add(testZp, glslTestZp, shiftZp, shiftZn, glslCreepZp)
    .add(testZn, glslTestZn, shiftZn, shiftZp, glslCreepZn);

export default torus;
export {fullTorus};