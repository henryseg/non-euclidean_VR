import {
    Scene,
    WebGLRenderer,
    Vector2,
    OrthographicCamera,
    FileLoader,
    BufferGeometry,
    BufferAttribute,
    Mesh
} from './module/three.module.js';

import {
    initGeometry,
    initObjects,
    setupMaterial,
    updateMaterial
} from "./Math.js";

import {initGui} from "./UI.js";
import {initEvents} from './Events.js';
import {Controls} from './Controls.js';

//import * as THREE from './module/three.module.js';
//-------------------------------------------------------
// Constant Variables
//-------------------------------------------------------

let globalVar = {
    ipDist: 0.03200000151991844,
    g_keyboard:'fr', // can be 'fr' or 'us' for the moment
    g_effect:undefined,
    g_material:undefined,
    g_controls:undefined,
    g_position:undefined,
    g_cellPosition:undefined,
    g_invCellPosition:undefined,
    g_phoneOrient:undefined,
    g_renderer:undefined,
    g_screenResolution:undefined,
    g_vr:0,
    g_leftPosition:undefined,
    g_rightPosition:undefined,
    g_stereoScreenOffset : 0.03,
    gens: undefined,
    invGens: undefined,
    lightPositions:[],
    lightIntensities:[],
    globalObjectPosition:undefined
};

//let ipDist = 0.03200000151991844; // inter pupil

/*
const g_keyboard = 'fr'; // can be 'fr' or 'us' for the moment
*/

//-------------------------------------------------------
// Global Variables
//-------------------------------------------------------

/*
let g_effect;
let g_material;
let g_controls;


let g_position;

let g_cellPosition, g_invCellPosition;

let g_phoneOrient;

let g_renderer;
let g_screenResolution;
let g_vr = 0;

let g_leftPosition, g_rightPosition;
let g_stereoScreenOffset = 0.03;

 */
//-------------------------------------------------------
// Scene Variables
//-------------------------------------------------------
let scene;
let mesh;
let camera;
let stats;
//-------------------------------------------------------
// Sets up precalculated values
//-------------------------------------------------------
/*
let gens;
let invGens;

 */

//-------------------------------------------------------
// Sets up the global objects
//-------------------------------------------------------
/*
let lightPositions = [];
let lightIntensities = [];

let globalObjectPosition;
//var globalObjectBoost;

 */

//-------------------------------------------------------
// Other global variables
//-------------------------------------------------------

let mainFrag;

//-------------------------------------------------------
// Sets up the scene
//-------------------------------------------------------
function init() {
    //Setup our THREE scene--------------------------------
    scene = new Scene();
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('webgl2');
    globalVar.g_renderer = new WebGLRenderer({
        canvas: canvas,
        context: context
    });
    document.body.appendChild(globalVar.g_renderer.domElement);
    globalVar.g_screenResolution = new Vector2(window.innerWidth, window.innerHeight);
    globalVar.g_effect = new THREE.VREffect(globalVar.g_renderer);
    camera = new OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1);
    globalVar.g_controls = new Controls();
    initGeometry();
    initObjects();
    globalVar.g_phoneOrient = [null, null, null];

    loadShaders();
    initEvents();
    initGui();
    stats = new Stats();
    stats.showPanel(1);
    stats.showPanel(2);
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
}


function loadShaders() {
    //Since our shader is made up of strings we can construct it from parts
    let loader = new FileLoader();
    loader.setResponseType('text');
    loader.load('shaders/raymarch.glsl', function (main) {
        mainFrag = main;
        setupMaterial(main);
        globalVar.g_effect.setSize(globalVar.g_screenResolution.x, globalVar.g_screenResolution.y);

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
        mesh = new Mesh(geom, globalVar.g_material);
        scene.add(mesh);
        animate();
    });
}

//-------------------------------------------------------
// Where our scene actually renders out to screen
//-------------------------------------------------------
function animate() {
    stats.begin();
    globalVar.g_controls.update();
    updateMaterial();
    THREE.VRController.update();
    globalVar.g_effect.render(scene, camera, animate);
    stats.end();
}

//-------------------------------------------------------
// Where the magic happens
//-------------------------------------------------------
init();


export{init, globalVar};