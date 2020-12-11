import {
    Color,
} from "../../js/lib/three.module.js";

import {
    Thurston,
} from "../../js/Thurston.js";

import {
    Material
} from "../../js/Material.js";


import * as geom from "../../js/geometry/sph/General.js";
import {Ball, BallComplement, PointLight} from "../../js/items/sph/Library.js";
import {
    cube
} from "../../js/geometry/sph/subgroups/cube.js";


const thurston = new Thurston(geom, cube, {keyboard: 'fr'});

const ball0 = new BallComplement(
    new geom.Vector(0, 0, 0),
    0.28 * Math.PI,
    new Material({color: new Color(1, 0.2, 0.2)}),
    false
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
