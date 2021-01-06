import {Matrix4, Vector4} from "../../../lib/three.module.js";
import {Teleportation} from "../../../core/groups/Teleportation.js";
import {TeleportationSet} from "../../../core/groups/TeleportationSet.js";
import {GroupElement} from "../../../commons/groups/isometry/GroupElement.js";
import element from "../../../commons/groups/isometry/shaders/element.js";


const normalXp = new Vector4(1, 0, 0, -1);
const normalXn = new Vector4(-1, 0, 0, -1);
const normalYp = new Vector4(0, 1, 0, -1);
const normalYn = new Vector4(0, -1, 0, -1);
const normalZp = new Vector4(0, 0, 1, -1);
const normalZn = new Vector4(0, 0, -1, -1);

function testXp(p) {
    return normalXp.dot(p.coords) > 0;
}

// language=GLSL
const glslTestXp = `//
bool testXp(Point p){
    vec4 n = vec4(1, 0, 0, -1);
    return dot(n, p.coords) > 0.;
}
`;

function testXn(p) {
    return normalXn.dot(p.coords) > 0;
}

// language=GLSL
const glslTestXn = `//
bool testXn(Point p){
    vec4 n = vec4(-1, 0, 0, -1);
    return dot(n, p.coords) > 0.;
}
`;

// language=GLSL
function testYp(p) {
    return normalYp.dot(p.coords) > 0;
}

const glslTestYp = `//
bool testYp(Point p){
    vec4 n = vec4(0, 1, 0, -1);
    return dot(n, p.coords) > 0.;
}
`;

// language=GLSL
function testYn(p) {
    return normalYn.dot(p.coords) > 0;
}

const glslTestYn = `//
bool testYn(Point p){
    vec4 n = vec4(0, -1, 0, -1);
    return dot(n, p.coords) > 0.;
}
`;


function testZp(p) {
    return normalZp.dot(p.coords) > 0;
}

// language=GLSL
const glslTestZp = `//
bool testZp(Point p){
    vec4 n = vec4(0, 0, 1, -1);
    return dot(n, p.coords) > 0.;
}
`;

function testZn(p) {
    return normalZn.dot(p.coords) > 0;
}

// language=GLSL
const glslTestZn = `//
bool testZn(Point p){
    vec4 n = vec4(0, 0, -1, -1);
    return dot(n, p.coords) > 0.;
}
`;

const shiftXp = new GroupElement();
shiftXp.isom.matrix.set(
    0, 0, 0, -1,
    0, 1, 0, 0,
    0, 0, 1, 0,
    1, 0, 0, 0
);
const shiftXn = new GroupElement();
shiftXn.isom.matrix.set(
    0, 0, 0, 1,
    0, 1, 0, 0,
    0, 0, 1, 0,
    -1, 0, 0, 0
);
const shiftYp = new GroupElement();
shiftYp.isom.matrix.set(
    1, 0, 0, 0,
    0, 0, 0, -1,
    0, 0, 1, 0,
    0, 1, 0, 0
);

const shiftYn = new GroupElement();
shiftYn.isom.matrix.set(
    1, 0, 0, 0,
    0, 0, 0, 1,
    0, 0, 1, 0,
    0, -1, 0, 0
);
const shiftZp = new GroupElement();
shiftZp.isom.matrix.set(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 0, -1,
    0, 0, 1, 0
);
const shiftZn = new GroupElement();
shiftZn.isom.matrix.set(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 0, 1,
    0, 0, -1, 0
);


//ADD ROTATIONS TO THE SIDE IDENTIFICATIONS TO MAKE INTO A MANIFOLD
shiftXp.isom.matrix.multiply(new Matrix4().makeRotationX(Math.PI / 2).transpose());
shiftXn.isom.matrix.multiply(new Matrix4().makeRotationX(-Math.PI / 2).transpose());
shiftYp.isom.matrix.multiply(new Matrix4().makeRotationY(Math.PI / 2).transpose());
shiftYn.isom.matrix.multiply(new Matrix4().makeRotationY(-Math.PI / 2).transpose());
shiftZp.isom.matrix.multiply(new Matrix4().makeRotationZ(Math.PI / 2).transpose());
shiftZn.isom.matrix.multiply(new Matrix4().makeRotationZ(-Math.PI / 2).transpose());


console.log("Isom X", shiftXp.isom.matrix.toLog());
console.log("Isom Y", shiftYp.isom.matrix.toLog());
console.log("Isom Z", shiftZp.isom.matrix.toLog());

const teleportXp = new Teleportation(testXp, glslTestXp, shiftXp, shiftXn);
const teleportXn = new Teleportation(testXn, glslTestXn, shiftXn, shiftXp);
const teleportYp = new Teleportation(testYp, glslTestYp, shiftYp, shiftYn);
const teleportYn = new Teleportation(testYn, glslTestYn, shiftYn, shiftYp);
const teleportZp = new Teleportation(testZp, glslTestZp, shiftZp, shiftZn);
const teleportZn = new Teleportation(testZn, glslTestZn, shiftZn, shiftZp);

export default new TeleportationSet([
        teleportXp,
        teleportXn,
        teleportYp,
        teleportYn,
        teleportZp,
        teleportZn
    ],
    element);