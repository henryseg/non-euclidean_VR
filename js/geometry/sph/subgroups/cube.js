import {
    Isometry,
    Teleport,
    Subgroup
} from "../General.js";
import {Matrix4, Vector4} from "../../../lib/three.module.js";


const normalXp = new Vector4(1, 0, 0, -1);
const normalXn = new Vector4(-1, 0, 0, -1);
const normalYp = new Vector4(0, 1, 0, -1);
const normalYn = new Vector4(0, -1, 0, -1);
const normalZp = new Vector4(0, 0, 1, -1);
const normalZn = new Vector4(0, 0, -1, -1);

function testXp(p) {
    return normalXp.dot(p.coords) > 0;
}

function testXn(p) {
    return normalXn.dot(p.coords) > 0;
}

function testYp(p) {
    return normalYp.dot(p.coords) > 0;
}

function testYn(p) {
    return normalYn.dot(p.coords) > 0;
}

function testZp(p) {
    return normalZp.dot(p.coords) > 0;
}

function testZn(p) {
    return normalZn.dot(p.coords) > 0;
}

const shiftXp = new Isometry();
shiftXp.matrix.set(
    0, 0, 0, -1,
    0, 1, 0, 0,
    0, 0, 1, 0,
    1, 0, 0, 0
);
const shiftXn = new Isometry();
shiftXn.matrix.set(
    0, 0, 0, 1,
    0, 1, 0, 0,
    0, 0, 1, 0,
    -1, 0, 0, 0
);
const shiftYp = new Isometry();
shiftYp.matrix.set(
    1, 0, 0, 0,
    0, 0, 0, -1,
    0, 0, 1, 0,
    0, 1, 0, 0
);

const shiftYn = new Isometry();
shiftYn.matrix.set(
    1, 0, 0, 0,
    0, 0, 0, 1,
    0, 0, 1, 0,
    0, -1, 0, 0
);
const shiftZp = new Isometry();
shiftZp.matrix.set(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 0, -1,
    0, 0, 1, 0
);
const shiftZn = new Isometry();
shiftZn.matrix.set(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 0, 1,
    0, 0, -1, 0

);


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
], "/shaders/subgroups/sph/cube.xml");

export {
    cube
}
