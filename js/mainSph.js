import {
    Color,
} from "./lib/three.module.js";

import {
    Thurston,
} from "./Thurston.js";

import {
    Material
} from "./Material.js";


import * as geom from "./geometry/sph/General.js";
import {Ball, PointLight} from "./items/sph/Library.js";
import {
    trivial
} from "./geometry/abstract/subgroups/trivial.js";


const thurston = new Thurston(geom, trivial, {keyboard: 'fr'});

const ball0 = new Ball(
    new geom.Vector(-0.5, 0, -0.5),
    0.2,
    new Material({color: new Color(1, 0.2, 0.2)}),
    true
);

const ball1 = new Ball(
    new geom.Vector(0, 0, -0.5),
    0.1,
    new Material({color: new Color(0, 0, 1)})
);

//  yellow light
const light0 = new PointLight(
    new geom.Point(1, 1, 0, 0).reduceError(),
    new Color(1, 1, 0),
    true
);

// cyan light
const light1 = new PointLight(
    new geom.Point(0, 0, 1, -1).reduceError(),
    new Color(0, 1, 1)
);

// magenta light
const light2 = new PointLight(
    new geom.Point(-1, -1, 0, 1).reduceError(),
    new Color(1, 0, 1)
);

thurston.addItems([ball0, ball1, light0, light1, light2]);
thurston.run();
