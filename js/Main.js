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
} from "./Uniforms.js";

import {
    initGui,
    guiInfo,
    capturer
} from "./UI.js";
import {
    initEvents,
    //VREffect
} from './Events.js';
import {
    Controls
} from './Controls.js';

//----------------------------------------------------------------------------------------------------------------------
// Global Variables
//----------------------------------------------------------------------------------------------------------------------

/*

    TODO: break the globals in several groups. Indeed the other modules do not need to access all the variables.

 */

let globals = {
    // ipDist: 0.03200000151991844,
    effect: undefined,
    material: undefined,
    controls: undefined,
    position: undefined,
    cellPosition: undefined,
    invCellPosition: undefined,
    //phoneOrient: undefined,
    renderer: undefined,
    screenResolution: undefined,
    //vr: 0,
    //leftPosition: undefined,
    //rightPosition: undefined,
    //stereoScreenOffset: 0.03,
    gens: undefined,
    invGens: undefined,
    lightPositions: [],
    lightIntensities: [],
    globalObjectPosition: undefined,
    display: 1,
    res: 2,
    lightRad: 0.5,
    refl: 0.,
    foggy: 0.5,
    planes: 1
};

//----------------------------------------------------------------------------------------------------------------------
// Scene variables
//----------------------------------------------------------------------------------------------------------------------

let scene;
let mesh;
let camera;
let stats;
let canvas;

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
    canvas = document.createElement('canvas');
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
    initObjects();
    //globals.phoneOrient = [null, null, null];

    loadShaders();
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



function loadShaders() {
    //Since our shader is made up of strings we can construct it from parts
    let loader = new FileLoader();
    loader.setResponseType('text');
    loader.load('shaders/01structs.glsl', function (structs) {
        loader.load('shaders/02setup.glsl', function (setup) {
            loader.load('shaders/03localGeo.glsl', function (locGeo) {
                loader.load('shaders/04globalGeo.glsl', function (globGeo) {
                    loader.load('shaders/05basicSDFs.glsl', function (basic) {
                        loader.load('shaders/06localScene.glsl', function (locScene) {
                            loader.load('shaders/07globalScene.glsl', function (globScene) {
                                loader.load('shaders/08teleport.glsl', function (teleport) {
                                    loader.load('shaders/09raymarch.glsl', function (raymarch) {
                                        loader.load('shaders/10materials.glsl', function (material) {
                                            loader.load('shaders/11lighting.glsl', function (light) {
                                                loader.load('shaders/12shader.glsl', function (shade) {
                                                    loader.load('shaders/13main.glsl', function (run) {
                                                        let main = structs.concat(setup).concat(locGeo).concat(globGeo).concat(basic).concat(locScene).concat(globScene).concat(teleport).concat(raymarch).concat(material).concat(light).concat(shade).concat(run);
                                                        //The rest of the shader-building is below
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
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}



//----------------------------------------------------------------------------------------------------------------------
// Where our scene actually renders out to screen
//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
// Renderer
//----------------------------------------------------------------------------------------------------------------------

//this controls the effect part of the animate loop
let VREffect = function (renderer, done) {

    this._renderer = renderer;

    this.render = function (scene, camera, animate) {
        let renderer = this._renderer;

        requestAnimationFrame(animate);

        renderer.render.apply(this._renderer, [scene, camera]);
        if (guiInfo.recording === true) {
            capturer.capture(canvas);
        }
    };
    this.setSize = function (width, height) {
        renderer.setSize(width, height);
    };
};




function animate() {
    stats.begin();
    globals.controls.update();
    updateMaterial();
    globals.effect.render(scene, camera, animate);
    stats.end();
}

//----------------------------------------------------------------------------------------------------------------------
// Where the magic happens
//----------------------------------------------------------------------------------------------------------------------

init();


export {
    init,
    globals,
    canvas
};
