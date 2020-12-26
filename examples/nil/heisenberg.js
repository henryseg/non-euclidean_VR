import {Color} from "../../js/lib/three.module.js";

import {Thurston} from "../../js/core/Thurston.js";

import * as geom from "../../js/geometries/nil/geometry/General.js";
import heisenberg from "../../js/geometries/nil/subgroups/heisenberg.js";
import trivial from "../../js/commons/subgroups/trivial.js";

import {Point} from "../../js/core/geometry/Point.js";
import {PhongMaterial} from "../../js/commons/material/all.js";
import {FakePointLight} from "../../js/geometries/nil/lights/all.js";
import {FakeBall, LocalFakeBall, LocalPotato, Solid} from "../../js/geometries/nil/solids/all.js";
import {complement, LocalFakeBallShape, LocalPotatoShape} from "../../js/geometries/nil/shapes/all.js";


const thurston = new Thurston(geom, heisenberg, {keyboard: 'fr'});

thurston.camera.maxDist = 20;
thurston.camera.maxSteps = 200;

// light colors
const lightColor1 = new Color(68 / 256, 197 / 256, 203 / 256, 1);
const lightColor2 = new Color(252 / 256, 227 / 256, 21 / 256, 1);
const lightColor3 = new Color(245 / 256, 61 / 256, 82 / 256, 1);
const lightColor4 = new Color(256 / 256, 142 / 256, 226 / 256, 1);

const light1 = new FakePointLight(
    new Point(1, 0, 0),
    lightColor1
);
const light2 = new FakePointLight(
    new Point(0, 1., 1),
    lightColor2
);
const light3 = new FakePointLight(
    new Point(-1, 0, 2),
    lightColor3
);
const light4 = new FakePointLight(
    new Point(0, -1, -1),
    lightColor4
);

const lights = [light1, light2, light3, light4];

// Phong shading material
const mat = new PhongMaterial({
    color: new Color(1, 1, 1),
    shininess: 5,
    lights: lights
});

const center = new LocalPotatoShape(new Point(), 0.55, 0.9, 1, 4);
const latticeShape = complement(center)
const lattice = new Solid(latticeShape, mat);

thurston.add(lattice);
thurston.run();
thurston.renderer.checkShader();




