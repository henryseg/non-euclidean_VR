import {
    Color,
    Vector3
} from "./lib/three.module.js";

import {
    Thurston,
} from "./Thurston.js";

import {
    Material
} from "./Material.js";


import * as geom from "./geometry/hyp/General.js";
import {
    Ball,
    PointLight
} from "./items/hyp/Library.js";
import {
    trivial
} from "./geometry/abstract/subgroups/trivial.js";


const thurston = new Thurston(geom, trivial, {
    keyboard: 'us'
});

//const ball0 = new BallComplement(
//    new geom.Point(0, 0, 0),
//    0.67,
//    new Material({
//        color: new Color(1, 0.2, 0.2)
//    }),
//    false
//);

const ball1 = new Ball(
    // new geom.Point(-.3, -0.1, -.5),
    new Vector3(0, 0, -2),
    0.2,
    new Material({
        color: new Color(0, 0, 1)
    })
);

//  yellow light
const light0 = new PointLight(
    new Vector3(1, 0, -3),
    new Color(1, 1, 0),
    true
);

// cyan light
const light1 = new PointLight(
    new Vector3(3, 1, 0),
    new Color(0, 1, 1)
);

// magenta light
const light2 = new PointLight(
    new Vector3(-1, -1, 1),
    new Color(1, 0, 1)
);

thurston.addItems([ball1, light0, light1, light2]);
thurston.run();
