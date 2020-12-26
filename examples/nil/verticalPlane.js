import {Clock, Color, Vector4} from "../../js/lib/three.module.js";

import {Thurston} from "../../js/core/Thurston.js";

import * as geom from "../../js/geometries/nil/geometry/General.js";
import trivial from "../../js/commons/subgroups/trivial.js";

import {Point} from "../../js/core/geometry/Point.js";
import {FakePointLight} from "../../js/geometries/nil/lights/all.js";
import {VerticalHalfSpace} from "../../js/geometries/nil/solids/all.js";
import {CheckerboardMaterial, SingleColorMaterial} from "../../js/geometries/nil/materials/all.js";
import {phongWrap, PhongWrapMaterial} from "../../js/commons/material/all.js";


const thurston = new Thurston(geom, trivial, {keyboard: 'fr'});

thurston.camera.maxDist = 50;
thurston.camera.maxSteps = 200;


const lightColor1 = new Color(68 / 256, 197 / 256, 203 / 256, 1);
const lightColor2 = new Color(252 / 256, 227 / 256, 21 / 256, 1);
const lightColor3 = new Color(245 / 256, 61 / 256, 82 / 256, 1);

const light1 = new FakePointLight(
    new Point(1, 0, 0),
    lightColor1
);
const light2 = new FakePointLight(
    new Point(0, 1., 1),
    lightColor2
);
const light3 = new FakePointLight(
    new Point(1, -2., -1),
    lightColor3
);

const lights = [light1, light2, light3];

const dir1 = new Vector4(0, 1, 0, 0);
const dir2 = new Vector4(0, 0, 1, 0);
const color1 = new Color(1, 1, 1);
const color2 = new Color(0, 0, 0);

const checkerboard = new CheckerboardMaterial(dir1, dir2, color1, color2);
const material = phongWrap(checkerboard,{lights:lights});

const halfSpace = new VerticalHalfSpace(new Point(-1, 0, 0), new Vector4(1, 0, 0, 0), material);
thurston.add(halfSpace);


const clock = new Clock();
const speed = 1.;

function animate() {
    const time = clock.getElapsedTime();
    const coeffColor = 0.5 + 0.4 * Math.cos(speed * time);
    const cos = Math.cos(0.7 * speed * time);
    const sin = Math.sin(0.5 * speed * time);
    color2.setRGB(coeffColor, coeffColor, coeffColor);

    dir1.set(0, cos, -sin, 0);
    dir2.set(0, sin, cos, 0);
}

thurston.callback = animate;
thurston.run();
thurston.renderer.checkShader();


