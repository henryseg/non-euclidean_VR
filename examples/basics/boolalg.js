import {Clock, Color} from "../../js/lib/three.module.js";

import * as geom from "../../js/geometries/euc/geometry/General.js";
import torus from "../../js/geometries/euc/subgroups/torus.js";

import {Camera, Renderer, Scene} from "../../js/core/General.js";
import {Mono} from "../../js/commons/stereos/mono/Mono.js";

import {Point} from "../../js/core/geometry/Point.js";
import {NormalMaterial} from "../../js/commons/material/normal/NormalMaterial.js";
import {BallShape} from "../../js/geometries/euc/shapes/ball/BallShape.js";
import {LocalBallShape} from "../../js/geometries/euc/shapes/localBall/LocalBallShape.js";
import {UnionShape} from "../../js/commons/shapes/union/UnionShape.js";
import {IntersectionShape} from "../../js/commons/shapes/instersection/IntersectionShape.js";
import {Solid} from "../../js/core/solids/Solid.js";

import {FlyControls} from "../../js/controls/FlyControls.js";
import {ComplementShape} from "../../js/commons/shapes/complement/ComplementShape.js";
import {PhongMaterial} from "../../js/commons/material/phong/PhongMaterial.js";
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


// magenta light
const light = new PointLight(
    new Point(0, 0.2, 0),
    new Color(1, 1, 1)
);
const lights = [light];

// Phong shading material
const mat0 = new PhongMaterial({
    color: new Color(0, 0, 1),
    specular: 0.1,
    shininess: 1,
    lights: lights
});
const mat1 = new PhongMaterial({
    color: new Color(0, 1, 0),
    specular: 0.1,
    shininess: 1,
    lights: lights
});
const mat2 = new PhongMaterial({
    color: new Color(1, 0, 0),
    specular: 0.1,
    shininess: 1,
    lights: lights
});

// Complement of a local ball
const ball0 = new LocalBallShape(
    new Point(0, 0, 0),
    1.07,
);

const complementShape = new ComplementShape(ball0);
const complementSolid = new Solid(complementShape, mat0);


// Union of two balls
const ball1 = new BallShape(
    new Point(-0.5, -0.08, 0),
    0.15
);

const ball2 = new BallShape(
    new Point(-0.5, 0.08, 0),
    0.15
);

const unionShape = new UnionShape(ball1, ball2);
const unionSolid = new Solid(unionShape, mat1);


// Intersection of two balls
const ball3 = new BallShape(
    new Point(0.5, -0.08, 0),
    0.15
);

const ball4 = new BallShape(
    new Point(0.5, 0.08, 0),
    0.15
);

const intersectionShape = new IntersectionShape(ball3, ball4);
const intersectionSolid = new Solid(intersectionShape, mat2);


// adding the solid to the scene
scene.add(unionSolid, intersectionSolid, complementSolid);

// building there renderer
renderer.build();

const clock = new Clock();
const flyControls = new FlyControls(camera, renderer.domElement, 'fr');


// rendering the scene
function animate() {
    const delta = clock.getDelta();
    flyControls.update(delta);
    renderer.render();
}

renderer.setAnimationLoop(animate);

