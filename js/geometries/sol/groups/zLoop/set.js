import {Teleportation} from "../../../../core/groups/Teleportation.js";
import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "../../../../commons/groups/isometry/Group.js";

const group = new Group();
const height = 1.01;


function testZp(p) {
    return p.coords.z > 0.5 * height;
}

//language=GLSL
const glslTestZp = `//
bool testZp(Point p){
    return p.coords.z > ${0.5 * height};
}
`;

function testZn(p) {
    return p.coords.z < -0.5 * height;
}

//language=GLSL
const glslTestZn = `//
bool testZn(Point p){
    return p.coords.z < ${-0.5 * height};
}
`;


const shiftZp = group.element();
const shiftZn = group.element();

shiftZp.isom.matrix.set(
    Math.exp(-height), 0, 0, 0,
    0, Math.exp(height), 0, 0,
    0, 0, 1, -height,
    0, 0, 0, 1
)
shiftZn.isom.matrix.set(
    Math.exp(height), 0, 0, 0,
    0, Math.exp(-height), 0, 0,
    0, 0, 1, height,
    0, 0, 0, 1
)


const teleportZp = new Teleportation(testZp, glslTestZp, shiftZp, shiftZn);
const teleportZn = new Teleportation(testZn, glslTestZn, shiftZn, shiftZp);

const teleportations = [
    teleportZp,
    teleportZn
];

export default new TeleportationSet(teleportations);