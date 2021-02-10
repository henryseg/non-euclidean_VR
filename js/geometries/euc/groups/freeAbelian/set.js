import {Group} from "./Group.js";
import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Teleportation} from "../../../../core/groups/Teleportation.js";


const group = new Group();

function testXp(p) {
    return p.coords.dot(group.halfTranslationA) > group.halfLengthSqA;
}

// language=GLSL
const glslTestXp = `//
bool testXp(Point p){
    return dot(p.coords, group.halfTranslationA) > group.halfLengthSqA;
}
`;
// language=GLSL
const glslCreepXp = `//
ExtVector creepXp(ExtVector v, float offset){
    Vector local = v.vector.local;
    float aux0 = group.halfLengthSqA - dot(local.pos.coords, group.halfTranslationA);
    float aux1 = dot(local.dir, group.halfTranslationA);
    float t = aux0 / aux1 + offset;
    return flow(v, t);
}
`;

function testXn(p) {
    return p.coords.dot(group.halfTranslationA) < -group.halfLengthSqA;
}

// language=GLSL
const glslTestXn = `//
bool testXn(Point p){
    return dot(p.coords, group.halfTranslationA) < -group.halfLengthSqA;
}
`;
// language=GLSL
const glslCreepXn = `//
ExtVector creepXn(ExtVector v, float offset){
    Vector local = v.vector.local;
    float aux0 = group.halfLengthSqA + dot(local.pos.coords, group.halfTranslationA);
    float aux1 = -dot(local.dir, group.halfTranslationA);
    float t = aux0 / aux1 + offset;
    return flow(v, t);
}
`;

function testYp(p) {
    return p.coords.dot(group.halfTranslationB) > group.halfLengthSqB;
}

// language=GLSL
const glslTestYp = `//
bool testYp(Point p){
    return dot(p.coords, group.halfTranslationB) > group.halfLengthSqB;
}
`;
// language=GLSL
const glslCreepYp = `//
ExtVector creepYp(ExtVector v, float offset){
    Vector local = v.vector.local;
    float aux0 = group.halfLengthSqB - dot(local.pos.coords, group.halfTranslationB);
    float aux1 = dot(local.dir, group.halfTranslationB);
    float t = aux0 / aux1 + offset;
    return flow(v, t);
}
`;

function testYn(p) {
    return p.coords.dot(group.halfTranslationB) < -group.halfLengthSqB;
}

// language=GLSL
const glslTestYn = `//
bool testYn(Point p){
    return dot(p.coords, group.halfTranslationB) < -group.halfLengthSqB;
}
`;
// language=GLSL
const glslCreepYn = `//
ExtVector creepYn(ExtVector v, float offset){
    Vector local = v.vector.local;
    float aux0 = group.halfLengthSqB + dot(local.pos.coords, group.halfTranslationB);
    float aux1 = -dot(local.dir, group.halfTranslationB);
    float t = aux0 / aux1 + offset;
    return flow(v, t);
}
`;

function testZp(p) {
    return p.coords.dot(group.halfTranslationC) > group.halfLengthSqC;
}

// language=GLSL
const glslTestZp = `//
bool testZp(Point p){
    return dot(p.coords, group.halfTranslationC) > group.halfLengthSqC;
}
`;
// language=GLSL
const glslCreepZp = `//
ExtVector creepZp(ExtVector v, float offset){
    Vector local = v.vector.local;
    float aux0 = group.halfLengthSqC - dot(local.pos.coords, group.halfTranslationC);
    float aux1 = dot(local.dir, group.halfTranslationC);
    float t = aux0 / aux1 + offset;
    return flow(v, t);
}
`;

function testZn(p) {
    return p.coords.dot(group.halfTranslationC) < -group.halfLengthSqC;
}

// language=GLSL
const glslTestZn = `//
bool testZn(Point p){
    return dot(p.coords, group.halfTranslationC) < -group.halfLengthSqC;
}
`;
// language=GLSL
const glslCreepZn = `//
ExtVector creepZn(ExtVector v, float offset){
    Vector local = v.vector.local;
    float aux0 = group.halfLengthSqC + dot(local.pos.coords, group.halfTranslationC);
    float aux1 = -dot(local.dir, group.halfTranslationC);
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