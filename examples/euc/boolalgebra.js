/**
 * Example demonstrating the use of boolean operations on solids.
 */

import {
    Color,
} from "../../js/lib/three.module.js";

import {
    Thurston,
} from "../../js/Thurston.js";

import {
    Material
} from "../../js/Material.js";


import * as geom from "../../js/geometry/euc/General.js";
import {Ball, PointLight} from "../../js/items/euc/Library.js";

import {
    torus
} from "../../js/geometry/euc/subgroups/torus.js";
import {Stereo} from "../../js/geometry/abstract/Stereo.js";
import {SolidComplement} from "../../js/items/abstract/SolidComplement.js";
import {SolidUnion} from "../../js/items/abstract/SolidUnion.js";
import {SolidIntersection} from "../../js/items/abstract/SolidIntersection.js";


const thurston = new Thurston(
    geom,
    torus,
    {keyboard: 'fr', maxDist: 5},
    new Stereo()
);

const ball0 = new Ball(
    new geom.Point(0, 0, 0),
    0.67,
    new Material({color: new Color(1, 0.2, 0.2)}),
    false
);

const complement = new SolidComplement(ball0);

const ball1 = new Ball(
    // new geom.Point(-.3, -0.1, -.5),
    new geom.Point(-0.08, 0, .5),
    0.15
);

const ball2 = new Ball(
    // new geom.Point(-.3, -0.1, -.5),
    new geom.Point(0.08, 0, .5),
    0.15
);

const union = new SolidUnion(
    ball1,
    ball2,
    new Material({color: new Color(0, 0, 1)})
    )
;


const ball3 = new Ball(
    // new geom.Point(-.3, -0.1, -.5),
    new geom.Point(-0.08, 0, -.5),
    0.2
);

const ball4 = new Ball(
    // new geom.Point(-.3, -0.1, -.5),
    new geom.Point(0.08, 0, -.5),
    0.2
);

const inter = new SolidIntersection(
    ball3,
    ball4,
    new Material({color: new Color(0, 1, 0)})
);


//  white light
const light0 = new PointLight(
    new geom.Point(1, 0, 0),
    new Color(1, 1, 1),
    true
);

//  white light
const light1 = new PointLight(
    new geom.Point(0, 1, -1),
    new Color(1, 1, 1)
);

//  white light
const light2 = new PointLight(
    new geom.Point(-1, -1, 1),
    new Color(1, 1, 1)
);

thurston.addItems([complement, union, inter, light0, light1, light2]);
thurston.run();
