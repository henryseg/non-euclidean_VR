import * as geom from "../../js/geometries/euc/geometry/General.js";
import torus from "../../js/geometries/euc/subgroups/torus.js";

import {BasicCamera, BasicRenderer, Scene} from "../../js/core/General.js";

import {Point} from "../../js/core/geometry/Point.js";
import {Ball} from "../../js/geometries/euc/solids/Ball.js";
import {NormalMaterial} from "../../js/commons/material/normal/NormalMaterial.js";


// initial setup
const camera = new BasicCamera({subgroup: torus});
const scene = new Scene();

const renderer = new BasicRenderer(geom, torus, camera, scene, {
    logarithmicDepthBuffer: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// defining a material
const mat = new NormalMaterial();
// defining a solid with this material
const ball = new Ball(
    new Point(0, 0, -1),
    0.3,
    mat
);
// adding the solid to the scene
scene.add(ball);

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

