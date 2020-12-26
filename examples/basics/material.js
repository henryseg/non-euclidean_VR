import {Color, Vector4} from "../../js/lib/three.module.js";

import * as geom from "../../js/geometries/euc/geometry/General.js";
import torus from "../../js/geometries/euc/subgroups/torus.js";

import {Camera, Renderer, Scene} from "../../js/core/General.js";
import {Mono} from "../../js/commons/stereos/mono/Mono.js";

import {Point} from "../../js/core/geometry/Point.js";
import {Ball, Solid} from "../../js/geometries/euc/solids/all.js";
import {SingleColorMaterial, NormalMaterial, PhongMaterial, phongWrap} from "../../js/commons/material/all.js";
import {PointLight} from "../../js/geometries/euc/lights/pointLight/PointLight.js";
import {CheckerboardMaterial} from "../../js/geometries/euc/materials/checkerboard/CheckerboardMaterial.js";
import {complement, HalfSpaceShape, intersection} from "../../js/geometries/euc/shapes/all.js";


// initial setup
const camera = new Camera({subgroup: torus});
camera.maxSteps = 400;
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
    new Point(1, -0.8, -1.2),
    new Color(1, 0, 1),
)

const light3 = new PointLight(
    new Point(-1, 0.5, -2),
    new Color(0, 1, 1),
)

const lights = [light1, light2, light3];

// Phong shading material
const phongMaterial = new PhongMaterial({shininess: 10, lights: lights});
const ball2 = new Ball(
    new Point(1, 0, -2),
    0.3,
    phongMaterial
)


const checkerboard = new CheckerboardMaterial(
    new Vector4(1, 0, 1, 0),
    new Vector4(-1, 0, 1, 0),
    new Color(1, 1, 1),
    new Color(0, 0, 0)
)

const checkerboardPhong = phongWrap(checkerboard, {lights:lights});


const crop = new HalfSpaceShape(
    new Point(1, 0, 0),
    new Vector4(1, 0, 0, 0)
)
const plane = new HalfSpaceShape(
    new Point(0, -1, 0),
    new Vector4(0, 1, 0, 0)
)
const leftPlaneShape = intersection(crop, plane);
const leftPlane = new Solid(leftPlaneShape, checkerboard);
const rightPlaneShape = intersection(complement(crop), plane);
const rightPlane = new Solid(rightPlaneShape, checkerboardPhong);

// adding the solid to the scene
scene.add(light1, light2, ball0, ball1, ball2, leftPlane, rightPlane);

// building there renderer
renderer.build();


// event controller on windows resize
function onWindowResize(event) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix();
}

window.addEventListener("resize", onWindowResize, false);


// rendering the scene
function animate() {
    renderer.render();
}

renderer.setAnimationLoop(animate);

