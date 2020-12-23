import {Color} from "../../js/lib/three.module.js";

import {Thurston} from "../../js/core/Thurston.js";

import * as geom from "../../js/geometries/sph/geometry/General.js";
import cube from "../../js/geometries/sph/subgroups/cube.js";

import {Point, Vector} from "../../js/geometries/sph/geometry/General.js";
import {ComplementShape} from "../../js/commons/shapes/complement/ComplementShape.js";
import {Solid} from "../../js/core/solids/Solid.js";
import {PointLight} from "../../js/geometries/sph/lights/pointLight/PointLight.js";
import {PhongMaterial} from "../../js/commons/material/phong/PhongMaterial.js";
import {Ball} from "../../js/geometries/sph/solids/Ball.js";
import {LocalBallShape} from "../../js/geometries/sph/shapes/localBall/LocalBallShape.js";

const thurston = new Thurston(geom, cube, {keyboard: 'fr'});

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
const ball0 = new LocalBallShape(
    new Point(),
    0.92,
);
const latticeShape = new ComplementShape(ball0);
const lattice = new Solid(latticeShape, mat0);


// Phong shading material
const mat1 = new PhongMaterial({
    color: new Color(0, 0, 1),
    shininess: 10,
    lights: lights
});

const ball1 = new Ball(
    new Vector(0, 0, -0.5),
    0.2,
    mat1
);

thurston.add(lattice, ball1, light0, light1, light2);
thurston.run();

