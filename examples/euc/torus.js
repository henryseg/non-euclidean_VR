import {Color} from "../../js/lib/three.module.js";

import {Thurston} from "../../js/core/Thurston.js";

import * as geom from "../../js/geometries/euc/geometry/General.js";
import torus from "../../js/geometries/euc/subgroups/torus.js";

import {LocalBallShape} from "../../js/geometries/euc/shapes/localBall/LocalBallShape.js";
import {Point} from "../../js/core/geometry/Point.js";
import {ComplementShape} from "../../js/commons/shapes/complement/ComplementShape.js";
import {Solid} from "../../js/core/solids/Solid.js";
import {PointLight} from "../../js/geometries/euc/lights/pointLight/PointLight.js";
import {PhongMaterial} from "../../js/commons/material/phong/PhongMaterial.js";
import {Ball} from "../../js/geometries/euc/solids/Ball.js";


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
const ball0 = new LocalBallShape(
    new Point(0, 0, 0),
    1.07,
);
const complementShape = new ComplementShape(ball0);
const complementSolid = new Solid(complementShape, mat0);


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

thurston.add(complementSolid, ball1, light0, light1, light2);
thurston.run();
thurston.renderer.checkShader();




