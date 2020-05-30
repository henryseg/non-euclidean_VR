import {
    Scene,
    WebGLRenderer,
    Vector2,
    OrthographicCamera,
    BufferGeometry,
    BufferAttribute,
    Mesh
} from './module/three.module.js';

import {
    initGeometry,
    setupMaterial,
    updateMaterial
} from "./toShader.js";

import {
    initGui
} from "./UI.js";

import {
    initEvents
} from './Events.js';

import {
    Controls
} from './Controls.js';

import {
    VRController
} from './module/VRController.js';

import {
    VREffect
} from './module/VREffect.js';

import {
    sceneBuilder
} from './Scene.js';


//----------------------------------------------------------------------------------------------------------------------
// Global Variables
//----------------------------------------------------------------------------------------------------------------------

/*

    TODO: break the globals in several groups. Indeed the other modules do not need to access all the variables.

 */

let globals = {
    ipDist: 0.032,
    effect: undefined,
    material: undefined,
    controls: undefined,
    position: undefined,
    cellPosition: undefined,
    invCellPosition: undefined,
    phoneOrient: undefined,
    renderer: undefined,
    screenResolution: undefined,
    vr: 0,
    leftPosition: undefined,
    rightPosition: undefined,
    stereoScreenOffset: 0.03,
    gens: undefined,
    invGens: undefined,
    invGenmatrices: undefined,
    // lightPositions: [],
    // lightIntensities: [],
    // globalObjectPosition: undefined,
    display: 1,
    res: 0.25,
    mirror: 0.1,
    brightness: 0.12,
};

//----------------------------------------------------------------------------------------------------------------------
// Scene variables
//----------------------------------------------------------------------------------------------------------------------

let scene;
let mesh;
let camera;
let stats;

//----------------------------------------------------------------------------------------------------------------------
// Shader variables
//----------------------------------------------------------------------------------------------------------------------

let mainFrag;

//----------------------------------------------------------------------------------------------------------------------
// Sets up the scene
//----------------------------------------------------------------------------------------------------------------------

function init() {
    //Setup our THREE scene--------------------------------
    scene = new Scene();
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('webgl2');
    globals.renderer = new WebGLRenderer({
        canvas: canvas,
        context: context
    });
    document.body.appendChild(globals.renderer.domElement);
    globals.screenResolution = new Vector2(window.innerWidth, window.innerHeight);
    globals.effect = new VREffect(globals.renderer);
    camera = new OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1);
    globals.controls = new Controls();
    initGeometry();
    //initObjects();
    globals.phoneOrient = [null, null, null];

    loadShaders()
    initEvents();
    initGui();
    stats = new Stats();
    stats.showPanel(1);
    stats.showPanel(2);
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
}


//----------------------------------------------------------------------------------------------------------------------
// Building the Shader out of the GLSL files
//----------------------------------------------------------------------------------------------------------------------


async function loadShaders() {
    let main = await sceneBuilder.build()
    mainFrag = main;
    setupMaterial(main);
    globals.effect.setSize(globals.screenResolution.x, globals.screenResolution.y);

    //Setup a "quad" to render on-------------------------
    let geom = new BufferGeometry();
    let vertices = new Float32Array([
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0,
        1.0, 1.0, 0.0,

        -1.0, -1.0, 0.0,
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0
    ]);
    geom.setAttribute('position', new BufferAttribute(vertices, 3));
    mesh = new Mesh(geom, globals.material);
    scene.add(mesh);
    animate();
}

//----------------------------------------------------------------------------------------------------------------------
// Where our scene actually renders out to screen
//----------------------------------------------------------------------------------------------------------------------

function animate() {
    stats.begin();
    globals.controls.update();
    updateMaterial();
    VRController.update();
    globals.effect.render(scene, camera, animate);
    stats.end();
}

//----------------------------------------------------------------------------------------------------------------------
// Where the magic happens
//----------------------------------------------------------------------------------------------------------------------

init();


export {
    init,
    globals
};
