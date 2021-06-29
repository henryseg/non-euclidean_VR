import {
    BasicRenderer,
    BasicCamera,
    Scene,
    freeAbelianSet as torus,
    NormalMaterial,
    Point,
    LocalBall
} from "../thurstonEuc.js";


// initial setup
const camera = new BasicCamera({set: torus});
const scene = new Scene();

const renderer = new BasicRenderer(torus, camera, scene, {}, {
    logarithmicDepthBuffer: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// defining a material
const mat = new NormalMaterial();
// defining solids with this material
const ball1 = new LocalBall(
    new Point(0, 0, -0.3),
    0.1,
    mat
);

// adding the solid to the scene
scene.add(ball1);

// building there renderer
renderer.build();

// event controller on windows resize
function onWindowResize(event) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix();
}

window.addEventListener("resize", onWindowResize, false);


renderer.checkShader();

// rendering the scene
function animate() {
    renderer.render();
}

renderer.setAnimationLoop(animate);