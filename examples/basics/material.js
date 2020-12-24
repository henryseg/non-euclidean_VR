import {Color} from "../../js/lib/three.module.js";

import * as geom from "../../js/geometries/euc/geometry/General.js";
import torus from "../../js/geometries/euc/subgroups/torus.js";

import {Camera, Renderer, Scene} from "../../js/core/General.js";
import {Mono} from "../../js/commons/stereos/mono/Mono.js";

import {Point} from "../../js/core/geometry/Point.js";
import {Ball} from "../../js/geometries/euc/solids/Ball.js";
import {SingleColorMaterial, NormalMaterial, PhongMaterial} from "../../js/commons/material/all.js";
import {PointLight} from "../../js/geometries/euc/lights/pointLight/PointLight.js";


// initial setup
const camera = new Camera({subgroup: torus});
const scene = new Scene();
const stereo = new Mono();

const renderer = new Renderer(geom, torus, camera, scene, stereo, {
    logarithmicDepthBuffer: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// single color material
const singleColorMaterial = new SingleColorMaterial(new Color(0.7, 0.1, 0.2));
const ball0 = new Ball(
    new Point(-1, 0, -2),
    0.3,
    singleColorMaterial
);

// normal material
const normalMaterial = new NormalMaterial();
// defining solids with this material
const ball1 = new Ball(
    new Point(0, 0, -2),
    0.3,
    normalMaterial
);

// lights for the Phong material
const light1 = new PointLight(
    new Point(2, 2, -2),
    new Color(1, 1, 0),
)
const light2 = new PointLight(
    new Point(1, -0.5, 0),
    new Color(1, 0, 1),
)

// Phong shading material
const phongMaterial = new PhongMaterial({shininess: 5, lights: [light1, light2]});
const ball2 = new Ball(
    new Point(1, 0, -2),
    0.3,
    phongMaterial
)

// adding the solid to the scene
scene.add(light1, light2, ball0, ball1, ball2);

// building there renderer
renderer.build();

// rendering the scene
function animate() {
    renderer.render();
}

renderer.setAnimationLoop(animate);

