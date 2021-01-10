import {Group} from "./Group.js";
import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Teleportation} from "../../../../core/groups/Teleportation.js";


const group = new Group();

function testXp(p) {
    return p.coords.dot(group.halfTranslationA) > group.halfLengthSqA;
    // return p.coords.x > group.cubeHalfWidth;
}

// language=GLSL
const glslTestXp = `//
bool testXp(Point p){
    return dot(p.coords, group.halfTranslationA) > group.halfLengthSqA;
    //    return p.coords.x > group.cubeHalfWidth;
}
`;

function testXn(p) {
    return p.coords.dot(group.halfTranslationA) < -group.halfLengthSqA;
    // return p.coords.x < -group.cubeHalfWidth;
}

// language=GLSL
const glslTestXn = `//
bool testXn(Point p){
    return dot(p.coords, group.halfTranslationA) < -group.halfLengthSqA;
    //    return p.coords.x < -group.cubeHalfWidth;
}
`;

function testYp(p) {
    return p.coords.dot(group.halfTranslationB) > group.halfLengthSqB;
    // return p.coords.y > group.cubeHalfWidth;
}

// language=GLSL
const glslTestYp = `//
bool testYp(Point p){
    return dot(p.coords, group.halfTranslationB) > group.halfLengthSqB;
    //    return p.coords.y > group.cubeHalfWidth;
}
`;

function testYn(p) {
    return p.coords.dot(group.halfTranslationB) < -group.halfLengthSqB;
    // return p.coords.y < -group.cubeHalfWidth;
}

// language=GLSL
const glslTestYn = `//
bool testYn(Point p){
    return dot(p.coords, group.halfTranslationB) < -group.halfLengthSqB;
    //    return p.coords.y < -group.cubeHalfWidth;
}
`;

function testZp(p) {
    return p.coords.dot(group.halfTranslationC) > group.halfLengthSqC;
    // return p.coords.z > group.cubeHalfWidth;
}

// language=GLSL
const glslTestZp = `//
bool testZp(Point p){
    return dot(p.coords, group.halfTranslationC) > group.halfLengthSqC;
    //    return p.coords.z > group.cubeHalfWidth;
}
`;

function testZn(p) {
    return p.coords.dot(group.halfTranslationC) < -group.halfLengthSqC;
    // return p.coords.z < -group.cubeHalfWidth;
}

// language=GLSL
const glslTestZn = `//
bool testZn(Point p){
    return dot(p.coords, group.halfTranslationC) < -group.halfLengthSqC;
    //    return p.coords.z < -group.cubeHalfWidth;
}
`;


const shiftXp = group.element(-1, 0, 0);
const shiftXn = group.element(1, 0, 0);
const shiftYp = group.element(0, -1, 0);
const shiftYn = group.element(0, 1, 0);
const shiftZp = group.element(0, 0, -1);
const shiftZn = group.element(0, 0, 1);


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

const neighbors = [
    {elt:shiftXp, inv:shiftXn},
    {elt:shiftXn, inv:shiftXp},
    {elt:shiftYp, inv:shiftYn},
    {elt:shiftYn, inv:shiftYp},
    {elt:shiftZp, inv:shiftZn},
    {elt:shiftZn, inv:shiftZp},

    {elt:shiftXp.clone().multiply(shiftYp), inv:shiftYn.clone().multiply(shiftXn)},
    {elt:shiftXp.clone().multiply(shiftYn), inv:shiftYp.clone().multiply(shiftXn)},
    {elt:shiftXn.clone().multiply(shiftYp), inv:shiftYn.clone().multiply(shiftXp)},
    {elt:shiftXn.clone().multiply(shiftYn), inv:shiftYp.clone().multiply(shiftXp)},

    {elt:shiftXp.clone().multiply(shiftZp), inv:shiftZn.clone().multiply(shiftXn)},
    {elt:shiftXp.clone().multiply(shiftZn), inv:shiftZp.clone().multiply(shiftXn)},
    {elt:shiftXn.clone().multiply(shiftZp), inv:shiftZn.clone().multiply(shiftXp)},
    {elt:shiftXn.clone().multiply(shiftZn), inv:shiftZp.clone().multiply(shiftXp)},

    {elt:shiftYp.clone().multiply(shiftZp), inv:shiftZn.clone().multiply(shiftYn)},
    {elt:shiftYp.clone().multiply(shiftZn), inv:shiftZp.clone().multiply(shiftYn)},
    {elt:shiftYn.clone().multiply(shiftZp), inv:shiftZn.clone().multiply(shiftYp)},
    {elt:shiftYn.clone().multiply(shiftZn), inv:shiftZp.clone().multiply(shiftYp)},
    
    
]

export default new TeleportationSet(teleportations, neighbors);
