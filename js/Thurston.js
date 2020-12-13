/**
 * @module Thurston
 *
 * @description
 * Module used to define and render a scene in one of the eight Thurston geometries.
 */


import {
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    SphereBufferGeometry,
    ShaderMaterial,
    Mesh,
    Clock,
    Vector3,
    Color
} from "./lib/three.module.js";

import {
    VRButton
} from "./lib/VRButton.js";

import {
    XRControllerModelFactory
} from "./lib/XRControllerModelFactory.js";

import {
    mustache
} from "./lib/mustache.mjs";

import Stats from './lib/stats.module.js';

import {
    GUI
} from "./lib/dat.gui.module.js";

import {
    RelPosition,
    Vector,
    Stereo
} from "./geometry/abstract/General.js";

import {
    KeyboardControls
} from "./controls/KeyboardControls.js";

import {
    VRControlsMove
} from "./controls/VRControlsMove.js";
import {
    VRControlsDrag
} from "./controls/VRControlsDrag.js";

import {
    bind
} from "./utils.js";


import * as WebXRPolyfill from "./lib/webxr-polyfill.module.js";


/**
 * Code for the way a property can be passed to the shader
 * @const
 */
const SHADER_PASS = {
    NONE: 0,
    CONSTANT: 1,
    UNIFORM: 2
}

/**
 * List of registered parameters
 * Only the parameters that come with a default value are options accepted in the constructor of Thurston.
 * Each options that is not passed to the constructor is set to its default value.
 * When the default value is an object, the function default should create a new instance of this object.
 * (Hence the need to use a function to generate the default value of the option.)
 * Each parameter has also tags to say how its value should be passed to the shader, and under which type.
 *
 * If a parameter `param` is tag with `stereo : true`, it means that the left and right eye shader to not receive the same data
 * (typically for the eye position).
 * In this situation, the parameter should be assigned as
 * `this.params.param = values` where `values` is an array of length 2.
 * The proxy will assign the first value to the left shader and the second one to the right shader.
 *
 * @const
 */
const PARAMS = {
    maxMarchingSteps: {
        default: function () {
            return 100;
        },
        shaderPass: SHADER_PASS.UNIFORM,
        shaderType: 'int'
    },
    minDist: {
        default: function () {
            return 0;
        },
        shaderPass: SHADER_PASS.UNIFORM,
        shaderType: 'float'
    },
    maxDist: {
        default: function () {
            return 50;
        },
        shaderPass: SHADER_PASS.UNIFORM,
        shaderType: 'float'
    },
    marchingThreshold: {
        default: function () {
            return 0.0001;
        },
        shaderPass: SHADER_PASS.UNIFORM,
        shaderType: 'float'
    },
    fov: {
        default: function () {
            return 90;
        },
        shaderPass: SHADER_PASS.NONE,
    },
    // HALF THE INTERPUPILLARY DISTANCE
    ipDist: {
        default: function () {
            return [-0.03200000151991844, 0.03200000151991844];
        },
        shaderPass: SHADER_PASS.UNIFORM,
        shaderType: 'float',
        stereo: true
    },
    position: {
        shaderPass: SHADER_PASS.NONE,
        shaderType: 'RelPosition'
    },
    eyePosition: {
        shaderPass: SHADER_PASS.UNIFORM,
        shaderType: 'RelPosition',
        stereo: true
    },
    camera: {
        shaderPass: SHADER_PASS.UNIFORM,
        shaderType: 'mat4',
        stereo: false
    }
};


/**
 * This handler is designed to traps the setters or the field `params` in a `Thurston` object
 * Each time a setter is called to assign a property to `params` the handler does the following
 * - Check if the property belongs to `PARAMS` (the list of registered parameters)
 * - If this property is listed as a uniform in `PARAMS`, update the list of uniforms
 * @const
 * @todo Change the strategy for the "magic": use a callback `_onChange` as in the Three.js library ?
 */
const PARAMS_HANDLER = {
    set: function (target, prop, value) {
        // basic security checks.
        // the uniforms cannot be reassigned.
        if (prop === '_uniformsLeft') {
            throw new Error("The uniforms cannot be reassigned.");
        }
        if (prop === '_uniformsRight') {
            throw new Error("The uniforms cannot be reassigned.");
        }
        // only the declared parameters are accepted.
        if (!(prop in PARAMS)) {
            throw new Error(`The parameter ${prop} is not supported.`);
        }

        // regular update of the property
        target[prop] = value;

        if (PARAMS[prop].shaderPass === SHADER_PASS.UNIFORM) {
            if (PARAMS[prop].stereo) {
                target._uniformsLeft[prop] = {
                    type: PARAMS[prop].shaderType,
                    value: target[prop][0]
                };
                target._uniformsRight[prop] = {
                    type: PARAMS[prop].shaderType,
                    value: target[prop][1]
                };
            } else {
                target._uniformsLeft[prop] = {
                    type: PARAMS[prop].shaderType,
                    value: target[prop]
                };
                target._uniformsRight[prop] = {
                    type: PARAMS[prop].shaderType,
                    value: target[prop]
                };
            }
        }
        return true;
    }
}


/**
 * @class
 *
 * @classdesc
 * Class used to create a scene in the specified geometry
 */
class Thurston {
    /**
     * Create an instance dedicated to build a scene in the prescribed geometry.
     * Property that are not setup yet, but will be used later are defined as `undefined`.
     * (Maybe not needed in JS, but good practice I guess.)
     * @param {Object} geom - a module handing the relevant geometry
     * @param {Subgroup} subgroup - a discrete subgroups
     * @param {Object} params - a list of options. See defaultOptions for the list of available options.
     * @param {Stereo} stereo - the stero handler
     * @todo Check if the geometry satisfies all the requirement?
     * @todo If a subgroup is not provided use the trivial one.
     */
    constructor(geom, subgroup, params = {}, stereo = undefined) {
        // loading the polyfill if WebXR is not supported
        const polyfill = new WebXRPolyfill.default();


        /**
         * The underlying geometry
         * @type {Object}
         */
        this.geom = geom;
        /**
         * The discrete subgroup defining a quotient manifold/orbifold
         * @type {Subgroup}
         */
        this.subgroup = subgroup;

        this.stereo = stereo;

        /**
         * The list of parameters of the object.
         * Interactions with `params` go through a proxy to automatically keep the list of uniforms up to date.
         * @type {Object}
         */
        this.params = new Proxy({_uniformsLeft: {}, _uniformsRight: {}}, PARAMS_HANDLER);
        for (const property in PARAMS) {
            if ('default' in PARAMS[property]) {
                if (property in params) {
                    this.params[property] = params[property];
                } else {
                    this.params[property] = PARAMS[property].default();
                }
            }
        }


        // Three.js content
        // Declaring first all the fields.
        // Maybe not needed, but perhaps good practice.
        /**
         * The renderer used by Three.js
         * @type {WebGLRenderer}
         * @private
         */
        this._renderer = undefined;
        /**
         * The Three.js camera
         * @type {PerspectiveCamera}
         * @private
         */
        this._camera = undefined;
        /**
         * The underlying Three.js scene
         * @type {Scene}
         * @private
         */
        this._scene = undefined;
        /**
         * VR Button
         * @type {HTMLButtonElement}
         * @private
         */
        this._VRButton = undefined;
        this._horizonRight = undefined;
        this._horizonLeft = undefined;
        this.initThreeJS();

        // setup the initial positions
        this.params.position = new RelPosition(this.subgroup);
        this.params.eyePosition = this.getEyePositions();

        // register the isometries involved in the discrete subgroup
        for (const teleport of this.subgroup.teleports) {
            // first add the isometries to the list of parameters
            // this cannot be static as the number/names of isometries depend on the subgroups
            this.registerParam(`${teleport.name}Isom`, SHADER_PASS.UNIFORM, 'Isometry');
            this.registerParam(`${teleport.name}Inv`, SHADER_PASS.UNIFORM, 'Isometry');
            // then register the isometries
            this.params[`${teleport.name}Isom`] = teleport.isom;
            this.params[`${teleport.name}Inv`] = teleport.inv;
        }

        /**
         * The list of solids in the non-euclidean scene
         * @type {Solid[]}
         * @private
         */
        this._solids = [];
        /**
         * The list of lights in the non-euclidean scene
         * @type {Light[]}
         * @private
         */
        this._lights = [];
        /**
         * The maximal number of lights directions
         * Computed automatically from the list of lights.
         * @type {number}
         * @private
         */
        this._maxLightDirs = undefined;


        /**
         * The keyboard controls
         * @type {KeyboardControls}
         * @private
         */
        this._keyboardControls = new KeyboardControls(
            this.params.position,
            this._camera,
            this._renderer.domElement,
            params.keyboard
        );
        this._keyboardControls.infos = bind(this, this.infos);

        this._VRControlsMove = new VRControlsMove(this.params.position, this._controller0);
        this._VRControlsDrag = new VRControlsDrag(this.params.position, this._controller1);

        /**
         * A clock to measure the time between two call of animate
         * @type {Clock}
         * @private
         */
        this._clock = new Clock();


        /**
         * The graphical user interface
         * @type {GUI}
         */
        this.gui = undefined;
        this.initUI();

        /**
         * The performance stats
         * @type {Stats}
         */
        this.stats = undefined;
        this.initStats();

        this.appendTitle();
        this.addEventListeners();
    }

    /**
     * Object used for stereo related computations
     * (offset of the eyes, pre-processing on the shader, etc).
     * @type {Stereo}
     */
    get stereo() {
        return this._stereo;
    }

    set stereo(value) {
        if (value === undefined) {
            this._stereo = new Stereo();
        } else {
            this._stereo = value;
        }

    }

    /**
     * Data displayed in the log, when the info key is pressed.
     */
    infos() {
        console.log(this._stereo.on);
    }

    /**
     * Register a new parameter to `PARAMS`
     * @param {string} name - the name of the parameter
     * @param {number} pass - the way it should be passed to the shader
     * @param {string} type - the type of the parameter on the shader side
     * @return {Thurston} the current Thurston object
     */
    registerParam(name, pass, type) {
        if (name in PARAMS) {
            throw new Error(`A parameter called ${name} already exists`);
        }
        PARAMS[name] = {
            shaderPass: pass,
            shaderType: type
        };
        return this;
    }

    /**
     * Set the given options.
     * @param {Object} params - a list of option
     * @return {Thurston} the current Thurston object
     */
    setParams(params) {
        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                this.setParam(key, params[key]);
            }
        }
        return this;
    }

    /**
     * Set the given option.
     * @param {string} key - key of the option
     * @param  value - the value of the option
     * @return {Thurston} the current Thurston object
     */
    setParam(key, value) {
        this.params[key] = value;
        return this;
    }

    /**
     * Adding an item to the scene.
     * @param{Solid|Light} item - the object to add
     * @return {Thurston} the current Thurston object
     */
    addItem(item) {
        // add the item to the appropriate list
        if (item.isSolid()) {
            this._solids.push(item);
        }
        if (item.isLight()) {
            this._lights.push(item);
        }
        return this;
    }

    /**
     * Adding a list of item to the scene.
     * @param{array} items - the list of items to add
     * @return {Thurston} the current Thurston object
     */
    addItems(items) {
        for (const item of items) {
            this.addItem(item);
        }
        return this
    }

    /**
     * The maximal number of light directions
     * @type {number}
     */
    get maxLightDirs() {
        if (this._maxLightDirs === undefined) {
            this._maxLightDirs = 0;
            for (const light of this._lights) {
                if (light.maxDirs > this._maxLightDirs) {
                    this._maxLightDirs = light.maxDirs
                }
            }
        }
        return this._maxLightDirs
    }

    /**
     * Return the position of the left and right eye, computed from the current position.
     * If the VR mode is not on, then both eye coincide with the observer position.
     * @return{RelPosition[]} the left and right eye positions
     */
    getEyePositions() {
        return this.stereo.eyes(
            this._camera.matrixWorld,
            this.params.position
        );
    }


    /**
     * add the name of the geometry to the title of the page
     */
    appendTitle() {
        const title = document.querySelector('title');
        title.append(' - ' + this.geom.name);
        return this;
    }


    /**
     * Set the keyboard used in the controls
     * @param {string} value - the keyboard type (us, fr,...)
     */
    setKeyboard(value) {
        this._keyboardControls.keyboard = value;
    }


    /**
     * Initialize the graphic user interface
     * @return {Thurston} the current Thurston object
     */
    initUI() {
        this.gui = new GUI();
        this.gui.close();
        this.gui.add({
            help: function () {
                window.open('https://github.com/henryseg/non-euclidean_VR');
            }
        }, 'help').name("Help/About");
        const keyboardController = this.gui.add(this._keyboardControls, 'keyboard', {
            QWERTY: 'us',
            AZERTY: 'fr'
        }).name("Keyboard");

        keyboardController.onChange = bind(this, this.setKeyboard)
        return this;
    }

    /**
     * Setup the Three.js scene
     */
    initThreeJS() {
        // setup the renderer
        this._renderer = new WebGLRenderer({
            logarithmicDepthBuffer: true,
        });
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._renderer.xr.enabled = true;
        this._renderer.xr.setReferenceSpaceType('local');
        this._renderer.setClearColor(new Color(0, 0, 1), 1);
        document.body.appendChild(this._renderer.domElement);
        this._VRButton = VRButton.createButton(this._renderer);
        document.body.appendChild(this._VRButton);

        // setup the camera
        this._camera = new PerspectiveCamera(
            this.params.fov,
            window.innerWidth / window.innerHeight,
            0.01,
            2000
        );
        this._camera.position.set(0, 0, 0);
        this._camera.lookAt(0, 0, -1);
        this._camera.layers.enable(1);

        this.params.camera = this._camera.matrixWorld;

        // build the scene with a single screen
        this._scene = new Scene();

        const controllerModelFactory = new XRControllerModelFactory();

        this._controllerGrip0 = this._renderer.xr.getControllerGrip(0);
        const model0 = controllerModelFactory.createControllerModel(this._controllerGrip0);
        this._controllerGrip0.add(model0);
        this._scene.add(this._controllerGrip0);

        this._controllerGrip1 = this._renderer.xr.getControllerGrip(1);
        const model1 = controllerModelFactory.createControllerModel(this._controllerGrip1);
        this._controllerGrip1.add(model1);
        this._scene.add(this._controllerGrip1);

        this._controller0 = this._renderer.xr.getController(0);
        this._scene.add(this._controller0);
        this._controller1 = this._renderer.xr.getController(1);
        this._scene.add(this._controller1);

        return this;
    }

    /**
     * Initialize the performance stats
     * @return {Thurston} the current Thurston object
     */
    initStats() {
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
        return this;
    }


    /**
     * Build the vertex shader from templates files.
     * @return {string} - the code of the shader
     */
    async buildShaderVertex() {
        const response = await fetch("/shaders/vertex.glsl");
        return await response.text();
    }


    /**
     * Collect all the parameters that will be passed to the shader as constants
     * @return {Object[]} the constants as a list of objects {name: string, type: string, value: *}
     */
    buildShaderDataConstants() {
        const res = [];
        for (const property in PARAMS) {
            if (PARAMS[property].shaderPass === SHADER_PASS.CONSTANT) {
                res.push({
                    name: property,
                    type: PARAMS[property].shaderType,
                    value: this.params[property]
                });
            }
        }
        return res;
    }

    /**
     * Collect all the parameters that will be passed to the shader as uniforms
     * @return {Object[]} the uniforms as a list of object {name: string, type:string}
     */
    buildShaderDataUniforms() {
        const res = [];
        for (const property in PARAMS) {
            if (PARAMS[property].shaderPass === SHADER_PASS.UNIFORM) {
                res.push({
                    name: property,
                    type: PARAMS[property].shaderType
                });
            }
        }
        return res;
    }

    /**
     * Return the list of all "background" blocks of GLSL code which are required for items and subgroup.
     * @return {Promise<string[]>}
     */
    async buildShaderDataBackground() {
        const files = [];

        // items files
        for (const list of [this._solids, this._lights]) {
            for (const item of list) {
                if (!files.includes(item.shaderSource)) {
                    files.push(item.shaderSource);
                }
            }
        }
        // discrete subgroup file
        files.push(this.subgroup.shaderSource);

        // for each file, extract the content of the background XML tag
        const blocks = [];
        let response;
        let xml
        const parser = new DOMParser();
        for (const file of files) {
            response = await fetch(file);
            xml = parser.parseFromString(await response.text(), 'application/xml');
            blocks.push(xml.querySelector('background').childNodes[0].nodeValue);
        }
        return blocks;
    }

    /**
     * Review all the items in the scene and setup their `glsl` property
     * Return the solids and lights as lists
     * @return {Promise<{solids: Solid[], lights: Light[]}>}
     */
    async buildShaderDataItems() {
        for (const solid of this._solids) {
            await solid.glslBuildData();
        }
        for (const light of this._lights) {
            await light.glslBuildData({maxLightDirs: this.maxLightDirs});
        }
        return {
            solids: this._solids,
            lights: this._lights
        };
    }


    /**
     * Build the fragment shader from templates files.
     * The data used to populate the templates are build by the functions
     * - buildShaderDataConstants (constants)
     * - buildShaderDataUniforms (uniforms)
     * - buildShaderDataBackground (background routines for the items and the subgroup)
     * - buildShaderDataItems (items)
     * - this.subgroup.glslBuildData (subgroup)
     * @return {string} - the code of the shader
     */
    async buildShaderFragment() {
        const header = {constants: this.buildShaderDataConstants()};
        const blocks = {blocks: await this.buildShaderDataBackground()};
        const items = await this.buildShaderDataItems();
        const setup = Object.assign({}, items, {uniforms: this.buildShaderDataUniforms()});
        await this.subgroup.glslBuildData();

        // A list of pairs (file, data)
        // - file is a path a a shader file
        // - data are the data passed to the template (if undefined, the file is just a plain GLSL file)
        const shaders = [
            {file: '/shaders/header.glsl', data: header},
            {file: this.geom.shader1, data: undefined},
            {file: '/shaders/geometry/abstract/commons1.glsl', data: undefined},
            {file: this.geom.shader2, data: undefined},
            {file: '/shaders/geometry/abstract/commons2.glsl', data: undefined},
            {file: '/shaders/items/abstract.glsl', data: undefined},
            {file: '/shaders/background.glsl', data: blocks},
            {file: '/shaders/setup.glsl', data: setup},
            {file: '/shaders/subgroup.glsl', data: this.subgroup},
            {file: '/shaders/sdf.glsl', data: items},
            {file: '/shaders/scene.glsl', data: items},
            {file: '/shaders/raymarch.glsl', data: undefined},
            {file: '/shaders/lighting.glsl', data: Object.assign({maxLightDirs: this.maxLightDirs}, items)},
            {file: this.stereo.shaderSource, data: undefined},
            {file: '/shaders/main.glsl', data: undefined}
        ];

        let response;
        let template;
        let fShader = "";
        // loop over the list of files
        for (const shader of shaders) {
            // load the template
            response = await fetch(shader.file);
            template = await response.text();
            // render the template and append the result to the shader
            if (shader.data === undefined) {
                fShader = fShader + template;
            } else {
                fShader = fShader + mustache.render(template, shader.data);
            }
        }
        console.log(fShader);

        return fShader;
    }


    /**
     * Init the horizon of the Three.js seen (with its shaders)
     * This cannot be done in the constructor as it is an async function.
     * @return {Promise<Thurston>}
     */
    async initHorizon() {
        // The lag that may occurs when we move the sphere to chase the camera can be the source of noisy movement.
        // We put a very large sphere around the user, to minimize this effect.
        const geometry = new SphereBufferGeometry(1000, 60, 40);
        // sphere eversion !
        geometry.scale(1, 1, -1);

        const vertexShader = await this.buildShaderVertex();
        const fragmentShader = await this.buildShaderFragment();
        const materialLeft = new ShaderMaterial({
            uniforms: this.params._uniformsLeft,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true
        });
        const materialRight = new ShaderMaterial({
            uniforms: this.params._uniformsRight,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true
        });
        this._horizonLeft = new Mesh(geometry, materialLeft);
        this._horizonRight = new Mesh(geometry, materialRight);
        this._horizonLeft.layers.set(1);
        this._horizonRight.layers.set(2);
        this._scene.add(this._horizonLeft);
        this._scene.add(this._horizonRight);

        return this;
    }

    /**
     * If the camera moved (most likely because VR headset updated its position),
     * then we update both the Three.js scene (by moving the horizon sphere)
     * and the non-euclidean one (by changing the position).
     * The eye positions are not updated here.
     * This should be done manually somewhere else.
     * @type{Function}
     */
    get chaseCamera() {
        if (this._chaseCamera === undefined) {
            let oldPositionL = new Vector3();
            let oldPositionR = new Vector3();

            this._chaseCamera = function () {
                // declare the new positions of the left and right cameras
                const newPositionL = new Vector3();
                const newPositionR = new Vector3();

                newPositionL.setFromMatrixPosition(this._camera.matrixWorld);
                newPositionR.setFromMatrixPosition(this._camera.matrixWorld);
                if (this._renderer.xr.isPresenting) {
                    // if XR is enable, we get the position of the left and right camera
                    const camerasVR = this._renderer.xr.getCamera(this._camera).cameras;
                    newPositionL.setFromMatrixPosition(camerasVR[0].matrixWorld);
                    newPositionR.setFromMatrixPosition(camerasVR[1].matrixWorld);
                } else {
                    // if XR is off, both positions coincide with the one of the camera
                    newPositionL.setFromMatrixPosition(this._camera.matrixWorld);
                    newPositionR.copy(newPositionL);
                }
                // center each horizon sphere at the appropriate point
                this._horizonLeft.position.copy(newPositionL);
                this._horizonRight.position.copy(newPositionR);
                // compute the old and new position (midpoint between the left and right cameras)
                const oldPosition = new Vector3().lerpVectors(oldPositionL, oldPositionR, 0.5);
                const newPosition = new Vector3().lerpVectors(newPositionL, newPositionR, 0.5);
                // flow the position along the difference of positions
                const deltaPosition = new Vector().subVectors(newPosition, oldPosition);
                this.params.position.flow(deltaPosition);

                // update the old left and right positions
                oldPositionL.copy(newPositionL);
                oldPositionR.copy(newPositionR);

                return this;
            };
        }
        return this._chaseCamera;
    }

    /**
     * Animates the simulation
     */
    animate() {
        const delta = this._clock.getDelta();
        this._keyboardControls.update(delta);
        this._VRControlsMove.update(delta);
        this._VRControlsDrag.update(delta);
        this.chaseCamera();

        this.params.eyePosition = this.getEyePositions();
        this._renderer.render(this._scene, this._camera);
        this.stats.update();
    }


    /**
     * Wrap together initialization and animation
     * We handle the promise here so that the function is no more async
     */
    run() {
        this.initHorizon().then(function (thurston) {
            // because of the VR, the animation loop is declared with setAnimationLoop,
            // see https://threejs.org/docs/#manual/en/introduction/How-to-create-VR-content
            const animate = bind(thurston, thurston.animate)
            thurston._renderer.setAnimationLoop(animate);
        })
    }

    /**
     * Action when the window is resized
     * @param {UIEvent} event
     */
    onWindowResize(event) {
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._camera.aspect = window.innerWidth / window.innerHeight
        this._camera.updateProjectionMatrix();
    }


    /**
     * Register all the event listeners
     */
    addEventListeners() {
        let self = this;
        window.addEventListener(
            "resize",
            function (event) {
                self.onWindowResize(event)
            },
            false
        );
        this._VRButton.addEventListener(
            "click",
            function (event) {
                self.stereo.switch();
            },
            false
        )
    }

}


export {
    Thurston
}
