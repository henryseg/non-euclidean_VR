import {
    Vector4,
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

const thurston = new Thurston(geom, {keyboard: 'fr'});

const ball0 = new items.Ball(
    new geom.Point().set([new Vector4(0, 0, -1, 1)]),
    0.5,
    new Material({color: new Color(1, 1, 1)})
);

const ball1 = new items.Ball(
    new geom.Point().set([new Vector4(-.3, -0.1, -.5, 1)]),
    0.1,
    new Material({color: new Color(0, 0, 1)})
);

const light0 = new items.PointLight(
    new geom.Point().set([new Vector4(1, 0, 0, 1)]),
    new Color(1, 1, 0)
);

const light1 = new items.PointLight(
    new geom.Point().set([new Vector4(0, 1, -1, 1)]),
    new Color(0, 1, 1)
);

const light2 = new items.PointLight(
    new geom.Point().set([new Vector4(-1, -1, 1, 1)]),
    new Color(1, 0, 1)
);

thurston.addItems([ball0, ball1, light0, light1, light2]);
thurston.run();
