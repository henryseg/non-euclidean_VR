import {TeleportationSet} from "../../../../core/teleportations/TeleportationSet.js";
import {Group} from "./Group.js";

const group = new Group();

function testP(p) {
    return group.normalP.dot(p.coords) > 0;
}

// language=GLSL
const glslTestP = `//
bool testP(Point p){
    return dot(group.normalP, p.coords) > 0.;
}
`;

function testN(p) {
    return group.normalN.dot(p.coords) < 0;
}

// language=GLSL
const glslTestN = `//
bool testN(Point p){
    return dot(group.normalN, p.coords) < 0.;
}
`;

const shiftP = group.element(-1);
const shiftN = group.element(1);


export default new TeleportationSet()
    .add(testP, glslTestP, shiftP, shiftN)
    .add(testN, glslTestN, shiftN, shiftP);
