//-------------------------------------------------------
// Constant Variables
//-------------------------------------------------------
const c_ipDist = 0.03200000151991844; // inter pupil

const g_keyboard = 'fr'; // can be 'fr' or 'us' for the moment

//-------------------------------------------------------
// Global Variables
//-------------------------------------------------------
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
let gens;
let invGens;

//-------------------------------------------------------
// Sets up the global objects
//-------------------------------------------------------
let lightPositions = [];
let lightIntensities = [];

let globalObjectPosition;
//var globalObjectBoost;

//-------------------------------------------------------
// Other global variables
//-------------------------------------------------------

let mainFrag;

//-------------------------------------------------------
// Sets up the scene
//-------------------------------------------------------
function init() {
    //Setup our THREE scene--------------------------------
    scene = new THREE.Scene();
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('webgl2');
    g_renderer = new THREE.WebGLRenderer({canvas: canvas, context: context});
    document.body.appendChild(g_renderer.domElement);
    g_screenResolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    g_effect = new THREE.VREffect(g_renderer);
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1);
    g_controls = new THREE.Controls();
    initGeometry();
    initObjects();
    g_phoneOrient = [null, null, null];

    loadShaders();
    stats = new Stats();
    stats.showPanel(1);
    stats.showPanel(2);
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
}


function loadShaders() {
    //Since our shader is made up of strings we can construct it from parts
    let loader = new THREE.FileLoader();
    loader.setResponseType('text');
    loader.load('shaders/raymarch.glsl', function (main) {
        mainFrag = main;
        setupMaterial(main);
        g_effect.setSize(g_screenResolution.x, g_screenResolution.y);

        //Setup a "quad" to render on-------------------------
        let geom = new THREE.BufferGeometry();
        let vertices = new Float32Array([
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,

            -1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,
            -1.0, 1.0, 0.0
        ]);
        geom.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        mesh = new THREE.Mesh(geom, g_material);
        scene.add(mesh);
        animate();
    });
}

//-------------------------------------------------------
// Where our scene actually renders out to screen
//-------------------------------------------------------
function animate() {
    stats.begin();
    g_controls.update();
    updateMaterial();
    THREE.VRController.update();
    g_effect.render(scene, camera, animate);
    stats.end();
}

//-------------------------------------------------------
// Where the magic happens
//-------------------------------------------------------
init();
