import {Color, Vector2} from "../../js/lib/three.module.js";

import {Thurston} from "../../js/commons/Thurston.js";

import * as geom from "../../js/geometries/euc/geometry/General.js";
import torus from "../../js/geometries/euc/subgroups/torus.js";

import {Point} from "../../js/core/geometry/Point.js";
import {PointLight} from "../../js/geometries/euc/lights/pointLight/PointLight.js";
import {PhongMaterial} from "../../js/commons/material/phong/PhongMaterial.js";

import {LocalBallShape, complement, union} from "../../js/geometries/euc/shapes/all.js";
import {Ball, Solid} from "../../js/geometries/euc/solids/all.js";
import {CheckerboardMaterial} from "../../js/commons/material/checkerboard/CheckerboardMaterial.js";
import {phongWrap} from "../../js/commons/material/phongWrap/PhongWrapMaterial.js";


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


const checkerboardBase = new CheckerboardMaterial(
    new Vector2(2, 2),
    new Vector2(-2, 2),
    new Color(1, 1, 1),
    new Color(0, 0, 0)
)

const checkerboardPhong = phongWrap(checkerboardBase, {lights: lights});



// Complement of a local ball
const centerBall = new LocalBallShape(
    new Point(0, 0, 0),
    1.05,
);

const latticeShape = complement(centerBall);
const lattice = new Solid(latticeShape, checkerboardPhong);


thurston.add(lattice, light0, light1, light2);
thurston.run();
thurston.renderer.checkShader();




