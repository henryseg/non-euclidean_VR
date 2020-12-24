import {Color} from "../../js/lib/three.module.js";

import {Thurston} from "../../js/core/Thurston.js";

import * as geom from "../../js/geometries/sph/geometry/General.js";
import hypercube from "../../js/geometries/sph/subgroups/cube.js";

import {Point, Vector} from "../../js/geometries/sph/geometry/General.js";
import {PointLight} from "../../js/geometries/sph/lights/pointLight/PointLight.js";
import {PhongMaterial} from "../../js/commons/material/phong/PhongMaterial.js";
import {Solid, Ball} from "../../js/geometries/sph/solids/all.js";
import {LocalBallShape, union, ComplementShape} from "../../js/geometries/sph/shapes/all.js";

const thurston = new Thurston(geom, hypercube, {keyboard: 'fr'});

// lights for the Phong material

//  yellow light
const light0 = new PointLight(
    new Vector(1, 0, 0),
    new Color(1, 1, 0),
);

// cyan light
const light1 = new PointLight(
    new Vector(0, 1, -1),
    new Color(0, 1, 1)
);

// magenta light
const light2 = new PointLight(
    new Vector(-1, -1, 1),
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
    new Point(),
    0.9,
);
const vertices = [];
for (let i = 0; i < 8; i++) {
    const i0 = i % 2;
    const i1 = 0.5 * (i - i0) % 2;
    const i2 = 0.25 * (i - 2 * i1 - i0) % 2;
    vertices[i] = new LocalBallShape(
        new Point((2 * i0 - 1) * 0.5, (2 * i1 - 1) * 0.5, (2 * i2 - 1) * 0.5, 0.5),
        0.2
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
const latticeShape = new ComplementShape(unionShape);
const lattice = new Solid(latticeShape, mat0);


// Phong shading material
const mat1 = new PhongMaterial({
    color: new Color(0, 0, 1),
    shininess: 10,
    lights: lights
});

const ball1 = new Ball(
    new Vector(0, 0, -0.5),
    0.1,
    mat1
);

thurston.add(lattice, ball1, light0, light1, light2);
thurston.run();

