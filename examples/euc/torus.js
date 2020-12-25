import {Color} from "../../js/lib/three.module.js";

import {Thurston} from "../../js/core/Thurston.js";

import * as geom from "../../js/geometries/euc/geometry/General.js";
import torus from "../../js/geometries/euc/subgroups/torus.js";

import {Point} from "../../js/core/geometry/Point.js";
import {PointLight} from "../../js/geometries/euc/lights/pointLight/PointLight.js";
import {PhongMaterial} from "../../js/commons/material/phong/PhongMaterial.js";

import {LocalBallShape, complement, union} from "../../js/geometries/euc/shapes/all.js";
import {Ball, Solid} from "../../js/geometries/euc/solids/all.js";


const thurston = new Thurston(geom, torus, {keyboard: 'fr'});


// lights for the Phong material

//  yellow light
const light0 = new PointLight(
    new Point(1, 0, 0),
    new Color(1, 1, 0),
);

// cyan light
const light1 = new PointLight(
    new Point(0, 1, -1),
    new Color(0, 1, 1)
);

// magenta light
const light2 = new PointLight(
    new Point(-1, -1, 1),
    new Color(1, 0, 1)
);
const lights = [light0, light1, light2];

// Phong shading material
const mat0 = new PhongMaterial({
    color: new Color(1, 0.2, 0.2),
    shininess: 5,
    lights: lights
});


// Complement of a local ball
const centerBall = new LocalBallShape(
    new Point(0, 0, 0),
    1.05,
);
const vertices = [];
for (let i = 0; i < 8; i++) {
    const i0 = i % 2;
    const i1 = 0.5 * (i - i0) % 2;
    const i2 = 0.25 * (i - 2 * i1 - i0) % 2;
    vertices[i] = new LocalBallShape(
        new Point((2 * i0 - 1) * 0.8, (2 * i1 - 1) * 0.8, (2 * i2 - 1) * 0.8),
        0.38
    );
}

const unionShape = union(
    centerBall,
    vertices[0],
    vertices[1],
    vertices[2],
    vertices[3],
    vertices[4],
    vertices[5],
    vertices[6],
    vertices[7],
);
const latticeShape = complement(unionShape);
const lattice = new Solid(latticeShape, mat0);


// Phong shading material
const mat1 = new PhongMaterial({
    color: new Color(0, 0, 1),
    shininess: 10,
    lights: lights
});

const ball1 = new Ball(
    new Point(0, 0, -.5),
    0.2,
    mat1
);

thurston.add(lattice, ball1, light0, light1, light2);
thurston.run();
thurston.renderer.checkShader();




