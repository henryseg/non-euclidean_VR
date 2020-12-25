import {Color} from "../../js/lib/three.module.js";

import {Thurston} from "../../js/core/Thurston.js";

import * as geom from "../../js/geometries/nil/geometry/General.js";
import trivial from "../../js/commons/subgroups/trivial.js";

import {Point} from "../../js/core/geometry/Point.js";
import {VeryFakeBallShape} from "../../js/geometries/nil/shapes/veryFakeBall/VeryFakeBallShape.js";
import {NormalMaterial, SingleColorMaterial} from "../../js/commons/material/all.js";
import {Solid} from "../../js/core/solids/Solid.js";


const thurston = new Thurston(geom, trivial, {keyboard: 'fr'});


// const mat = new SingleColorMaterial(
//     new Color(1, 0, 0)
// );

const mat = new NormalMaterial();

const shape = new VeryFakeBallShape(
    new Point(0, 0, -1),
    0.5
);

const solid = new Solid(shape, mat);


thurston.add(solid);
thurston.run();
thurston.renderer.checkShader();




