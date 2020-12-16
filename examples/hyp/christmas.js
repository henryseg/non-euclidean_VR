/**
 * Christmas colored theme. Numerical error are here for the garland!
 */

import {
    Color,
    Vector3
} from "../../js/lib/three.module.js";

import {
    Thurston,
} from "../../js/Thurston.js";

import {
    Material
} from "../../js/Material.js";


import * as geom from "../../js/geometry/hyp/General.js";
import {
    Ball,
    PointLight,
    BallComplement
} from "../../js/items/hyp/Library.js";

import {
    cube
} from "../../js/geometry/hyp/subgroups/cube.js";
import {NativeStereo} from "../../js/geometry/hyp/stereo/NativeStereo.js";


const thurston = new Thurston(geom, cube, {
        keyboard: 'fr',
        stereoMode: 'native',
    },
    new NativeStereo()
);

const ball0 = new Ball(
    new Vector3(0, 0, 0),
    0.1,
    new Material({
        shininess:3,
        specularity:0.8,
        color: new Color(255. / 256., 0. / 256., 0. / 256.)
    }),
    false
);

const ball1 = new BallComplement(
    new Vector3(0, 0, 0),
    1.05,
    new Material({
        color: new Color('#3a9c2b')
    }),
    false
);

//  yellow light
const light0 = new PointLight(
    new Vector3(1, 0, -3),
    new Color(1, 1, 1),
    true
);

// cyan light
const light1 = new PointLight(
    new Vector3(3, 1, 0),
    new Color(1, 1, 1)
);

// magenta light
const light2 = new PointLight(
    new Vector3(-1, -1, 1),
    new Color(1, 1, 1)
);

thurston.addItems([ball0, ball1, light0, light1, light2]);
thurston.run();
