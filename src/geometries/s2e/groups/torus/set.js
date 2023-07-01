import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "./Group.js";

const group = new Group();

function testAngleP(p) {
    return p.coords.dot(group.normalP) > 0;
}

//language=GLSL
const glslTestAngleP = `//

bool testAngleP(Point p){
    return dot(p.coords, group.normalP) > 0.;
}
`;

function testAngleN(p) {
    return p.coords.dot(group.normalN) > 0;
}

//language=GLSL
const glslTestAngleN = `//

bool testAngleN(Point p){
    return dot(p.coords, group.normalN) > 0.;
}
`;


function testWp(p) {
    return p.coords.w > group.halfHeight;
}

//language=GLSL
const glslTestWp = `//

bool testWp(Point p){
    return p.coords.w > group.halfHeight;
}
`;

function testWn(p) {
    return p.coords.w < -group.halfHeight;
}

//language=GLSL
const glslTestWn = `//

bool testWn(Point p){
    return p.coords.w < -group.halfHeight;
}
`;

const shiftAngleP = group.element(-1, 0);
const shiftAngleN = group.element(1, 0);
const shiftWp = group.element(0, -1);
const shiftWn = group.element(0, 1);


const set = new TeleportationSet()
    .add(testAngleP, glslTestAngleP, shiftAngleP, shiftAngleN)
    .add(testAngleN, glslTestAngleN, shiftAngleN, shiftAngleP)
    .add(testWp, glslTestWp, shiftWp, shiftWn)
    .add(testWn, glslTestWn, shiftWn, shiftWp);

export default set;