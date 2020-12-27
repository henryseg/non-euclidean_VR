import {Color, Vector2, Vector3, Vector4} from "../../js/lib/three.module.js";

import * as geom from "../../js/geometries/euc/geometry/General.js";
import torus from "../../js/geometries/euc/subgroups/torus.js";

import {BasicCamera, BasicRenderer, Scene} from "../../js/core/General.js";

import {Point} from "../../js/core/geometry/Point.js";
import {Ball, HalfSpace} from "../../js/geometries/euc/solids/all.js";
import {
    SingleColorMaterial,
    NormalMaterial,
    PhongMaterial,
    phongWrap,
    CheckerboardMaterial
} from "../../js/commons/material/all.js";
import {PointLight} from "../../js/geometries/euc/lights/pointLight/PointLight.js";


// initial setup
const camera = new BasicCamera({subgroup: torus});
camera.maxSteps = 400;
const scene = new Scene();


const renderer = new BasicRenderer(geom, torus, camera, scene, {
    logarithmicDepthBuffer: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// single color material
const singleColorMaterial = new SingleColorMaterial(new Color(0.7, 0.1, 0.2));
const ball0 = new Ball(
    new Point(-1, 0.5, -2),
    0.3,
    singleColorMaterial
);

// normal material
const normalMaterial = new NormalMaterial();
// defining solids with this material
const ball1 = new Ball(
    new Point(0, 0.5, -2),
    0.3,
    normalMaterial
);

const checkerboardRaw = new CheckerboardMaterial(
    new Vector2(Math.PI, 0),
    new Vector2(0, Math.PI),
    new Color(0.3, 0.5, 1),
    new Color(1, 1, 0.2)
)


const ball2 = new Ball(
    new Point(1, 0.5, -2),
    0.3,
    checkerboardRaw
);

// lights for the Phong material
const light1 = new PointLight(
    new Point(2, 1, -2),
    new Color(1, 1, 0),
)
const light2 = new PointLight(
    new Point(1, 0.2, -0.5),
    new Color(1, 0, 1),
)

const light3 = new PointLight(
    new Point(-1, 1, -2),
    new Color(0, 1, 1),
)

const lights = [light1, light2, light3];

// Phong shading material
const phongMaterial = new PhongMaterial({shininess: 10, lights: lights});
const ball3 = new Ball(
    new Point(-1, -0.5, -2),
    0.3,
    phongMaterial
)



const normalPhong = phongWrap(normalMaterial, {lights: lights});

const ball4 = new Ball(
    new Point(0, -0.5, -2),
    0.3,
    normalPhong
);


const checkerboardBase = new CheckerboardMaterial(
    new Vector2(2, 2),
    new Vector2(-2, 2),
    new Color(1, 1, 1),
    new Color(0, 0, 0)
)

const checkerboardPhong = phongWrap(checkerboardBase, {lights: lights});


const ball5 = new Ball(
    new Point(1,-0.5,-2),
    0.3,
    checkerboardPhong
);

// adding the solid to the scene
scene.add(light1, light2, ball0, ball1, ball2, ball3, ball4, ball5);

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
renderer.checkShader();

