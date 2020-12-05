


import {
    Color,
} from "./lib/three.module.js";

import {
    Thurston,
} from "./thurston.js";

import {
    Material
} from "./material.js";


import * as geom from "./geometry/euc.js";
import * as items from "./items/euc.js";




const cubeHalfWidth = 0.5;

function testXp(p) {
    return p.coords.x > cubeHalfWidth;
}

function testXn(p) {
    return p.coords.x < -cubeHalfWidth;
}

function testYp(p) {
    return p.coords.y > cubeHalfWidth;
}

function testYn(p) {
    return p.coords.y < -cubeHalfWidth;
}

function testZp(p) {
    return p.coords.z > cubeHalfWidth;
}

function testZn(p) {
    return p.coords.z < -cubeHalfWidth;
}

const shiftXp = new geom.Isometry().makeTranslation(new geom.Point(-2 * cubeHalfWidth, 0, 0));
const shiftXn = new geom.Isometry().makeTranslation(new geom.Point(2 * cubeHalfWidth, 0, 0));
const shiftYp = new geom.Isometry().makeTranslation(new geom.Point(0, -2 * cubeHalfWidth, 0));
const shiftYn = new geom.Isometry().makeTranslation(new geom.Point(0, 2 * cubeHalfWidth, 0));
const shiftZp = new geom.Isometry().makeTranslation(new geom.Point(0, 0, -2 * cubeHalfWidth));
const shiftZn = new geom.Isometry().makeTranslation(new geom.Point(0, 0, 2 * cubeHalfWidth));
//console.log(new geom.Point().set([new Vector4(2 * a, 0, 0, 1)]));
//console.log(shiftXn);

const teleportXp = new geom.Teleport(testXp, shiftXp, shiftXn);
const teleportXn = new geom.Teleport(testXn, shiftXn, shiftXp);
const teleportYp = new geom.Teleport(testYp, shiftYp, shiftYn);
const teleportYn = new geom.Teleport(testYn, shiftYn, shiftYp);
const teleportZp = new geom.Teleport(testZp, shiftZp, shiftZn);
const teleportZn = new geom.Teleport(testZn, shiftZn, shiftZp);

const subgroup = new geom.DiscreteSubgroup([
    teleportXp,
    teleportXn,
    teleportYp,
    teleportYn,
    teleportZp,
    teleportZn
], "shaders/subgroups/euc/torus.xml");

const thurston = new Thurston(geom, subgroup, {keyboard: 'fr'});

const ball0 = new items.Ball(
    new geom.Point(0,0,0),
    0.1,
    new Material({color: new Color(1, 0.2, 0.2)}),
    false
);

const ball1 = new items.Ball(
    // new geom.Point(-.3, -0.1, -.5),
    new geom.Point(0, 0, -.5),
    0.2,
    new Material({color: new Color(0, 0, 1)})
);

//  yellow light
const light0 = new items.PointLight(
    new geom.Point(1, 0, 0),
    new Color(1, 1, 0),
    true
);

// cyan light
const light1 = new items.PointLight(
    new geom.Point(0, 1, -1),
    new Color(0, 1, 1)
);

// magenta light
const light2 = new items.PointLight(
    new geom.Point(-1, -1, 1),
    new Color(1, 0, 1)
);

thurston.addItems([ball0, ball1, light0, light1, light2]);
thurston.run();
