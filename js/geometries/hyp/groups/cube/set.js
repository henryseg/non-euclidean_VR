import {Vector} from "../../geometry/General.js";
import {Matrix4} from "../../../../lib/three.module.js";
import {Teleportation} from "../../../../core/groups/Teleportation.js";
import {TeleportationSet} from "../../../../core/groups/TeleportationSet.js";
import {Group} from "../../../../commons/groups/isometry/Group.js";


const cubeHalfWidth = 0.6584789485;
const modelHalfCube = 0.5773502692;

const group = new Group();

function testXp(p) {
    return p.coords.x > modelHalfCube * p.coords.w;
}

// language=GLSL
const glslTestXp = `//
bool testXp(Point p){
    return p.coords.x > ${modelHalfCube} * p.coords.w;
}
`;

function testXn(p) {
    return p.coords.x < -modelHalfCube * p.coords.w;
}

// language=GLSL
const glslTestXn = `//
bool testXn(Point p){
    return p.coords.x < -${modelHalfCube} * p.coords.w;
}
`;

function testYp(p) {
    return p.coords.y > modelHalfCube * p.coords.w;
}

// language=GLSL
const glslTestYp = `//
bool testYp(Point p){
    return p.coords.y > ${modelHalfCube} * p.coords.w;
}
`;

function testYn(p) {
    return p.coords.y < -modelHalfCube * p.coords.w;
}

// language=GLSL
const glslTestYn = `//
bool testYn(Point p){
    return p.coords.y < -${modelHalfCube} * p.coords.w;
}
`;

function testZp(p) {
    return p.coords.z > modelHalfCube * p.coords.w;
}

// language=GLSL
const glslTestZp = `//
bool testZp(Point p){
    return p.coords.z > ${modelHalfCube} * p.coords.w;
}
`;

function testZn(p) {
    return p.coords.z < -modelHalfCube * p.coords.w;
}

// language=GLSL
const glslTestZn = `//
bool testZn(Point p){
    return p.coords.z < -${modelHalfCube} * p.coords.w;
}
`;


const shiftXp = group.element();
const shiftXn = group.element();
const shiftYp = group.element();
const shiftYn = group.element();
const shiftZp = group.element();
const shiftZn = group.element();

shiftXp.isom.makeTranslationFromDir(new Vector(-2 * cubeHalfWidth, 0, 0));
shiftXn.isom.makeTranslationFromDir(new Vector(2 * cubeHalfWidth, 0, 0));
shiftYp.isom.makeTranslationFromDir(new Vector(0, -2 * cubeHalfWidth, 0));
shiftYn.isom.makeTranslationFromDir(new Vector(0, 2 * cubeHalfWidth, 0));
shiftZp.isom.makeTranslationFromDir(new Vector(0, 0, -2 * cubeHalfWidth));
shiftZn.isom.makeTranslationFromDir(new Vector(0, 0, 2 * cubeHalfWidth));

//ADD ROTATIONS TO THE SIDE IDENTIFICATIONS TO MAKE INTO A MANIFOLD
shiftXp.isom.matrix.multiply(new Matrix4().makeRotationX(Math.PI / 2).transpose());
shiftXn.isom.matrix.multiply(new Matrix4().makeRotationX(-Math.PI / 2).transpose());
shiftYp.isom.matrix.multiply(new Matrix4().makeRotationY(Math.PI / 2).transpose());
shiftYn.isom.matrix.multiply(new Matrix4().makeRotationY(-Math.PI / 2).transpose());
shiftZp.isom.matrix.multiply(new Matrix4().makeRotationZ(Math.PI / 2).transpose());
shiftZn.isom.matrix.multiply(new Matrix4().makeRotationZ(-Math.PI / 2).transpose());

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

export default new TeleportationSet(teleportations);
