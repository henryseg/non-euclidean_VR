import {
    Vector,
    Isometry,
    Teleport,
    Subgroup
} from "../General.js";
import {Matrix4} from "../../../lib/three.module.js";


const cubeHalfWidth = 0.6584789485;
const modelHalfCube = 0.5773502692

function testXp(p) {
    return p.coords.x > modelHalfCube * p.coords.w;
}

function testXn(p) {
    return p.coords.x < -modelHalfCube * p.coords.w;
}

function testYp(p) {
    return p.coords.y > modelHalfCube * p.coords.w;
}

function testYn(p) {
    return p.coords.y < -modelHalfCube * p.coords.w;
}

function testZp(p) {
    return p.coords.z > modelHalfCube * p.coords.w;
}

function testZn(p) {
    return p.coords.z < -modelHalfCube * p.coords.w;
}

const shiftXp = new Isometry().makeTranslationFromDir(new Vector(-2 * cubeHalfWidth, 0, 0));
const shiftXn = new Isometry().makeTranslationFromDir(new Vector(2 * cubeHalfWidth, 0, 0));
const shiftYp = new Isometry().makeTranslationFromDir(new Vector(0, -2 * cubeHalfWidth, 0));
const shiftYn = new Isometry().makeTranslationFromDir(new Vector(0, 2 * cubeHalfWidth, 0));
const shiftZp = new Isometry().makeTranslationFromDir(new Vector(0, 0, -2 * cubeHalfWidth));
const shiftZn = new Isometry().makeTranslationFromDir(new Vector(0, 0, 2 * cubeHalfWidth));

//ADD ROTATIONS TO THE SIDE IDENTIFICATIONS TO MAKE INTO A MANIFOLD
shiftXp.matrix.multiply(new Matrix4().makeRotationX(Math.PI / 2).transpose());
shiftXn.matrix.multiply(new Matrix4().makeRotationX(-Math.PI / 2).transpose());
shiftYp.matrix.multiply(new Matrix4().makeRotationY(Math.PI / 2).transpose());
shiftYn.matrix.multiply(new Matrix4().makeRotationY(-Math.PI / 2).transpose());
shiftZp.matrix.multiply(new Matrix4().makeRotationZ(Math.PI / 2).transpose());
shiftZn.matrix.multiply(new Matrix4().makeRotationZ(-Math.PI / 2).transpose());


const teleportXp = new Teleport(testXp, shiftXp, shiftXn);
const teleportXn = new Teleport(testXn, shiftXn, shiftXp);
const teleportYp = new Teleport(testYp, shiftYp, shiftYn);
const teleportYn = new Teleport(testYn, shiftYn, shiftYp);
const teleportZp = new Teleport(testZp, shiftZp, shiftZn);
const teleportZn = new Teleport(testZn, shiftZn, shiftZp);

const cube = new Subgroup([
    teleportXp,
    teleportXn,
    teleportYp,
    teleportYn,
    teleportZp,
    teleportZn
], "/shaders/subgroups/hyp/cube.xml");

export {
    cube
}
