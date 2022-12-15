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

// language=GLSL
const glslCreepZp = `//
float creepZp(ExtVector v, float offset){
    vec4 coords = v.vector.local.pos.coords;
    return ${0.5 * height} - coords.z + offset;
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

// language=GLSL
const glslCreepZn = `//
float creepZn(ExtVector v, float offset){
    vec4 coords = v.vector.local.pos.coords;
    return ${0.5 * height} + coords.z + offset;
}
`;


const shiftZp = group.element();
const shiftZn = group.element();

const ehP = Math.exp(height);
const ehM = Math.exp(-height);

shiftZp.isom.matrix.set(
    ehM, 0, 0, 0,
    0, ehP, 0, 0,
    0, 0, 1, -height,
    0, 0, 0, 1
)
shiftZn.isom.matrix.set(
    ehP, 0, 0, 0,
    0, ehM, 0, 0,
    0, 0, 1, height,
    0, 0, 0, 1
)


export default new TeleportationSet()
    // .add(testZp, glslTestZp, shiftZp, shiftZn)
    // .add(testZn, glslTestZn, shiftZn, shiftZp);
    .add(testZp, glslTestZp, shiftZp, shiftZn, glslCreepZp)
    .add(testZn, glslTestZn, shiftZn, shiftZp, glslCreepZn);
