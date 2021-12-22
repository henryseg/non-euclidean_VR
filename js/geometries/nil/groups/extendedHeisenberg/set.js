import {Teleportation} from "../../../../core/groups/Teleportation.js";
import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "./Group.js";

const group = new Group();

function testXp(p) {
    const aux = group.translationA.clone().applyMatrix4(group.dotMatrix);
    //console.log("aux Xp", aux.toLog(), p.coords.dot(aux));
    return p.coords.dot(aux) > 0.5;
}

// language=GLSL
const glslTestXp = `//
bool testXp(Point p){
    return dot(p.coords, group.dotMatrix * group.translationA) > 0.5;
}
`;

// // language=GLSL
// const glslTestXp = `//
// bool testXp(Point p){
//     return p.coords.x > 0.5;
// }
// `;

function testXn(p) {
    const aux = group.translationA.clone().applyMatrix4(group.dotMatrix);
    //console.log("aux Xn", aux.toLog(), p.coords.dot(aux));
    return p.coords.dot(aux) < -0.5;
}

// language=GLSL
const glslTestXn = `//
bool testXn(Point p){
    return dot(p.coords, group.dotMatrix * group.translationA) < -0.5;
}
`;

// // language=GLSL
// const glslTestXn = `//
// bool testXn(Point p){
//     return p.coords.x < -0.5;
// }
// `;

function testYp(p) {
    const aux = group.translationB.clone().applyMatrix4(group.dotMatrix);
    return p.coords.dot(aux) > 0.5;
}

// language=GLSL
const glslTestYp = `//
bool testYp(Point p){
    return dot(p.coords, group.dotMatrix * group.translationB) > 0.5;
}
`;

// // language=GLSL
// const glslTestYp = `//
// bool testYp(Point p){
//     return p.coords.y > 0.5;
// }
// `;

function testYn(p) {
    const aux = group.translationB.clone().applyMatrix4(group.dotMatrix);
    return p.coords.dot(aux) < -0.5;
}

// language=GLSL
const glslTestYn = `//
bool testYn(Point p){
    return dot(p.coords, group.dotMatrix * group.translationB) < -0.5;
}
`;

// // language=GLSL
// const glslTestYn = `//
// bool testYn(Point p){
//     return p.coords.y < -0.5;
// }
// `;

function testZp(p) {
    const aux = group.translationC.clone().applyMatrix4(group.dotMatrix);
    //console.log("aux Xp", aux.toLog(), p.coords.dot(aux));
    return p.coords.dot(aux) > 0.5;
}

// language=GLSL
const glslTestZp = `//
bool testZp(Point p){
    return dot(p.coords, group.dotMatrix * group.translationC) > 0.5;
}
`;

// // language=GLSL
// const glslTestZp = `//
// bool testZp(Point p){
//     return p.coords.z > 0.5;
// }
// `;


function testZn(p) {
    const aux = group.translationC.clone().applyMatrix4(group.dotMatrix);
    return p.coords.dot(aux) < -0.5;
}

// language=GLSL
const glslTestZn = `//
bool testZn(Point p){
    return dot(p.coords, group.dotMatrix * group.translationC) < -0.5;
}
`;

// // language=GLSL
// const glslTestZn = `//
// bool testZn(Point p){
//     return p.coords.z < -0.5;
// }
// `;


const shiftXp = group.element(-1, 0, 0);
const shiftXn = group.element(1, 0, 0);
const shiftYp = group.element(0, -1, 0);
const shiftYn = group.element(0, 1, 0);
const shiftZp = group.element(0, 0, -1);
const shiftZn = group.element(0, 0, 1);

//console.log("Xp", shiftXp.toIsometry().matrix.toLog());
//console.log("Yp", shiftYp.toIsometry().matrix.toLog());
//console.log("Zp", shiftZp.toIsometry().matrix.toLog());


/**
 * Subgroup corresponding to the integer Heisenberg group
 */
export default new TeleportationSet()
    .add(testXp, glslTestXp, shiftXp, shiftXn)
    .add(testXn, glslTestXn, shiftXn, shiftXp)
    .add(testYp, glslTestYp, shiftYp, shiftYn)
    .add(testYn, glslTestYn, shiftYn, shiftYp)
    .add(testZp, glslTestZp, shiftZp, shiftZn)
    .add(testZn, glslTestZn, shiftZn, shiftZp);



