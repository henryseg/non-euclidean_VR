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
} from "../../js/commons/material/phong/Material.js";


import * as geom from "../../js/geometry/euc/General.js";
import {Ball, PointLight} from "../../js/objects/euc/Library.js";

import {
    torus
} from "../../js/geometry/euc/subgroups/torus.js";
import {Stereo} from "../../js/core/abstract/Stereo.js";
import {SolidComplement, SolidUnion, SolidIntersection, SolidWrap} from "../../js/objects/abstract/Solids.js";

const thurston = new Thurston(
    geom,
    torus,
    {keyboard: 'fr', maxDist: 5},
    new Stereo()
);

const ball0 = new Ball(
    new geom.Point(0, 0, 0),
    0.67,
    new Material({color: new Color(1, 0.6, 0.6)}),
    false
);

const complement = new SolidComplement(ball0);

const ball1 = new Ball(
    new geom.Point(-0.5, -0.08, 0),
    0.15
);

const ball2 = new Ball(
    new geom.Point(-0.5, 0.08, 0),
    0.15
);

const union = new SolidUnion(
    ball1,
    ball2,
    new Material({color: new Color(0, 0, 1)})
    )
;


const ball3 = new Ball(
    new geom.Point(0.5, -0.08, 0),
    0.2
);

const ball4 = new Ball(
    new geom.Point(0.5, 0.08, 0),
    0.2
);

const inter = new SolidIntersection(
    ball3,
    ball4,
    new Material({color: new Color(0, 1, 0)})
);

const ball5 = new Ball(
    new geom.Point(0, 0, -0.5),
    0.1,
    new Material({color: new Color(1, 0, 0)})
);


const ball6 = new Ball(
    new geom.Point(0, 0, -0.5),
    0.2,
    new Material({color: new Color(1, 0, 0)})
);

const wrapped = new SolidWrap(ball6, ball5);


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

thurston.addItems([complement, union, inter, wrapped, light0, light1, light2]);
thurston.run();
