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
import {
    torusSubgroup
} from "./subgroup/euc/torus.js";


const thurston = new Thurston(geom, torusSubgroup, {keyboard: 'fr'});

const ball0 = new items.BallComplement(
    new geom.Point(0, 0, 0),
    0.67,
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
