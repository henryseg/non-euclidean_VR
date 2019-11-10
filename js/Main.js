//-------------------------------------------------------
// Constant Variables
//-------------------------------------------------------
const c_ipDist = 0.03200000151991844; // inter pupil

//-------------------------------------------------------
// Global Variables
//-------------------------------------------------------
var g_material;
var g_controls;
var g_renderer;
var g_currentBoost;
var g_facing;
var g_cellBoost;
var g_invCellBoost;
var g_phoneOrient;
var g_raymarch;
var g_vr = 0;
var g_leftBoost, g_rightBoost;

//-------------------------------------------------------
// Scene Variables
//-------------------------------------------------------
var composer;
var stats;
//-------------------------------------------------------
// Sets up precalculated values
//-------------------------------------------------------
var gens;
var invGens;

//-------------------------------------------------------
// Sets up the global objects
//-------------------------------------------------------
var lightPositions = [];
var lightIntensities = [];
var globalObjectBoost;

//-------------------------------------------------------
// Sets up the scene
//-------------------------------------------------------
var init = function () {
    //Setup our THREE scene--------------------------------
    g_renderer = new THREE.WebGLRenderer();
    var screenRes = new THREE.Vector2(window.innerWidth, window.innerHeight);
    g_renderer.setSize(screenRes.x, screenRes.y);
    document.body.appendChild(g_renderer.domElement);

    //Initialize varirables, objects, and stats
    stats = new Stats();
    stats.showPanel(1);
    stats.showPanel(2);
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
    g_controls = new THREE.Controls();
    initGeometry();
    initObjects();
    g_phoneOrient = [null, null, null];

    //-------------------------------------------------------
    // "Post" Processing - Since we are not using meshes we actually 
    //                     don't need to do traditional rendering we 
    //                     can just use post processed effects
    //-------------------------------------------------------

    //Composer **********************************************
    composer = new THREE.EffectComposer(g_renderer);

    //Shader Passes *****************************************
    //Raymarch
    g_raymarch = raymarchPass(screenRes);
    composer.addPass(g_raymarch);
    g_raymarch.renderToScreen = true;
    //------------------------------------------------------
    //Let's get rendering
    //------------------------------------------------------
    animate();
}

//-------------------------------------------------------
// Where our scene actually renders out to screen
//-------------------------------------------------------
var animate = function () {
    stats.begin();
    requestAnimationFrame(animate);
    composer.render();
    g_controls.update();
    stats.end();
}

//-------------------------------------------------------
// Where the magic happens
//-------------------------------------------------------
init();
