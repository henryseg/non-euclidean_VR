import {
    Color,
} from "./lib/three.module.js";

import {
    Thurston,
} from "./Thurston.js";

import {
    Material
} from "./Material.js";


import * as geom from "./geometry/euc/General.js";
import {Ball, BallComplement, PointLight} from "./items/euc/Library.js";
import {
    torusSubgroup
} from "./subgroups/euc/torus.js";




const thurston = new Thurston(geom, torusSubgroup, {keyboard: 'fr'});

const ball0 = new BallComplement(
    new geom.Point(0, 0, 0),
    0.67,
    new Material({color: new Color(1, 0.2, 0.2)}),
    false
);

const ball1 = new Ball(
    // new geom.Point(-.3, -0.1, -.5),
    new geom.Point(0, 0, -.5),
    0.2,
    new Material({color: new Color(0, 0, 1)})
);

//  yellow light
const light0 = new PointLight(
    new geom.Point(1, 0, 0),
    new Color(1, 1, 0),
    true
);

// cyan light
const light1 = new PointLight(
    new geom.Point(0, 1, -1),
    new Color(0, 1, 1)
);

// magenta light
const light2 = new PointLight(
    new geom.Point(-1, -1, 1),
    new Color(1, 0, 1)
);

thurston.addItems([ball0, ball1, light0, light1, light2]);
thurston.run();
