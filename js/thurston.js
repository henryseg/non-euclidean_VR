/**
 * @module Thurston
 *
 * @description
 * Module used to define and render a scene in one of the eight Thurston geometries.
 */

import * as WebXRPolyfill from "./lib/webxr-polyfill.module.js";


import {
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    SphereBufferGeometry,
    ShaderMaterial,
    Mesh,
    Clock,
    Quaternion,
    Vector3,
    Vector4,
    Matrix4,
} from "./lib/three.module.js";


import {
    VRButton
} from "./lib/VRButton.js";

import {
    mustache
} from "./lib/mustache.mjs";

import Stats from './lib/stats.module.js';

import {
    GUI
} from "./lib/dat.gui.module.js";

/**
 * Code for movement of the observer.
 * @const
 */
const ACTION_CODES = {
    TRANSLATE_X_POS: 0,
    TRANSLATE_X_NEG: 1,
    TRANSLATE_Z_POS: 2,
    TRANSLATE_Y_POS: 3,
    TRANSLATE_Y_NEG: 4,
    TRANSLATE_Z_NEG: 5,
    ROTATE_X_POS: 6,
    ROTATE_X_NEG: 7,
    ROTATE_Y_POS: 8,
    ROTATE_Y_NEG: 9,
    ROTATE_Z_POS: 10,
    ROTATE_Z_NEG: 11,
    INFOS: 12
}


/**
 * Keyboard commands.
 * Each main entry correspond to a keyboard type (American, French, etc).
 * KeyCode are replaced by Key (as KeyCode are now deprecated).
 * @const
 */
const KEYBOARD_BINDINGS = {
    'us': {
        "a": ACTION_CODES.ROTATE_Y_POS, // a
        "d": ACTION_CODES.ROTATE_Y_NEG, // d
        "w": ACTION_CODES.ROTATE_X_POS,// w
        "s": ACTION_CODES.ROTATE_X_NEG, // s
        "q": ACTION_CODES.ROTATE_Z_POS, // q
        "e": ACTION_CODES.ROTATE_Z_NEG, // e
        "ArrowUp": ACTION_CODES.TRANSLATE_Z_NEG, // up
        "ArrowDown": ACTION_CODES.TRANSLATE_Z_POS,// down
        "ArrowLeft": ACTION_CODES.TRANSLATE_X_NEG, // left
        "ArrowRight": ACTION_CODES.TRANSLATE_X_POS,// right
        "'": ACTION_CODES.TRANSLATE_Y_POS,// single quote
        "/": ACTION_CODES.TRANSLATE_Y_NEG,// fwd slash
        "i": ACTION_CODES.INFOS, // i
    },
    'fr': {
        "q": ACTION_CODES.ROTATE_Y_POS, // q
        "d": ACTION_CODES.ROTATE_Y_NEG,// d
        "z": ACTION_CODES.ROTATE_X_POS, // z
        "s": ACTION_CODES.ROTATE_X_NEG, // s
        "a": ACTION_CODES.ROTATE_Z_POS,// a
        "e": ACTION_CODES.ROTATE_Z_NEG,// e
        "ArrowUp": ACTION_CODES.TRANSLATE_Z_NEG,// up
        "ArrowDown": ACTION_CODES.TRANSLATE_Z_POS,// down
        "ArrowLeft": ACTION_CODES.TRANSLATE_X_NEG, // left
        "ArrowRight": ACTION_CODES.TRANSLATE_X_POS, // right
        "ù": ACTION_CODES.TRANSLATE_Y_POS, // ù
        "=": ACTION_CODES.TRANSLATE_Y_NEG, // =
        "i": ACTION_CODES.INFOS, // i
    }
};


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
    keyboard: {
        default: function () {
            return 'us';
        },
        shaderPass: SHADER_PASS.NONE
    },
    speedTranslation: {
        default: function () {
            return 0.2;
        },
        shaderPass: SHADER_PASS.NONE
    },
    speedRotation: {
        default: function () {
            return 0.4;
        },
        shaderPass: SHADER_PASS.NONE
    },
    MAX_DIRS: {
        default: function () {
            return 3;
        },
        shaderPass: SHADER_PASS.CONSTANT,
        shaderType: 'int'
    },
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
    ipDist: {
        default: function () {
            return 0.03200000151991844;
        },
        shaderPass: SHADER_PASS.NONE
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
     * @param {DiscreteSubgroup} subgroup - a discrete subgroups
     * @param {Object} params - a list of options. See defaultOptions for the list of available options.
     * @todo Check if the geometry satisfies all the requirement?
     * @todo If a subgroup is not provided use the trivial one.
     */
    constructor(geom, subgroup, params = {}) {
        // loading the polyfill if WebXR is not supported
        const polyfill = new WebXRPolyfill.default();

        /**
         * The underlying geometry
         * @type {Object}
         */
        this.geom = geom;
        /**
         * The discrete subgroup defining a quotient manifold/orbifold
         * @type {DiscreteSubgroup}
         */
        this.subgroup = subgroup;

        /// setup the WebGL renderer
        this._renderer = new WebGLRenderer();
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._renderer.xr.enabled = true;
        this._renderer.xr.setReferenceSpaceType('local');
        document.body.appendChild(this._renderer.domElement);
        document.body.appendChild(VRButton.createButton(this._renderer));

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

        // setup the initial positions
        this.params.position = new this.geom.RelPosition(this.subgroup);
        this.params.eyePosition = this.getEyePositions();

        // register the isometries involved in the discrete subgroup
        for (const teleport of this.subgroup.teleports) {
            // first add the isometries to the list of parameters
            // this cannot be static as the number/names of isometries depend on the subgroup
            this.registerParam(`${teleport.name}Isom`, SHADER_PASS.UNIFORM, 'Isometry');
            this.registerParam(`${teleport.name}Inv`, SHADER_PASS.UNIFORM, 'Isometry');
            // then register the isometries
            this.params[`${teleport.name}Isom`] = teleport.isom;
            this.params[`${teleport.name}Inv`] = teleport.inv;
        }
        /**
         * The graphical user interface
         * @type {GUI}
         */
        this.gui = undefined;
        /**
         * The performance stats
         * @type {undefined}
         */
        this.stats = undefined;

        // The list of solids in the scene as an object {id: solid}
        this._solids = {};
        // The list of lights in the scene as an object {id: light}
        this._lights = {};
        // The maximal number of directions for a light
        this._maxLightDirs = undefined;

        // first available id of an item (to be incremented when adding items)
        this._id = 0;


        // The Three.js scene
        this._scene = undefined;
        // The Three.js camera
        this._camera = undefined;
        this._cameraOldPosition = new Vector3();
        this._cameraNewPosition = new Vector3();
        this._horizonRight = undefined;
        this._horizonLeft = undefined;

        // fix the default keyboard binding
        this._keyboardBinding = undefined;
        this.setKeyboard(this.params.keyboard);
        // setup the controls for keyboard action
        // used to handle an active tag, in case the user hold a key down.
        this._keyboardControls = {};
        for (const action of Object.values(ACTION_CODES)) {
            this._keyboardControls[action] = {active: false};
        }
        // setup the translation/rotation "direction" used when the user moves via the keyboard
        this._keyboardDirs = {
            translation: new Vector4(0, 0, 0, 0),
            rotation: new Vector4(0, 0, 0, 0),
        };
        // clock to measure the time between two frames
        this._clock = new Clock();
    }

    /**
     * Set the keyboard
     * @param {string} keyboardCode - currently supported values are 'us' and 'fr' (US and French keyboard)
     */
    setKeyboard(keyboardCode) {
        this.params.keyboard = keyboardCode;
        this._keyboardBinding = KEYBOARD_BINDINGS[this.params.keyboard];
    }

    /**
     * The solids in the scene as a list
     * @type {Solid[]}
     */
    get listSolids() {
        return Object.values(this._solids);
    }

    /**
     * The lights in the scene as a list
     * @type {Light[]}
     */
    get listLights() {
        return Object.values(this._lights);
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
     * @param{Item} item - the item to add
     * @return {Thurston} the current Thurston object
     */
    addItem(item) {
        item.id = this._id;
        if (item.isSolid()) {
            this._solids[this._id] = item;
        }
        if (item.isLight()) {
            this._lights[this._id] = item;
        }
        this._id = this._id + 1;

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
            for (const light of this.listLights) {
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
        // start from the position of the observer.
        const rightEye = this.params.position.clone();
        const leftEye = this.params.position.clone();

        // check if we are in VR mode or not
        if (this._renderer.xr.isPresenting) {
            // if we are in VR mode we offset the position of the left and right eyes
            const xDir = new this.geom.Vector(1, 0, 0).multiplyScalar(0.5 * this.params.ipDist);

            const rightDir = xDir.applyFacing(this.params.position.local);
            const rightShift = new this.geom.Position().flow(rightDir);
            rightEye.local.multiply(rightShift);

            const leftDir = xDir.clone().negate();
            const leftShift = new this.geom.Position().flow(leftDir);
            leftEye.local.multiply(leftShift);
        }

        // return the positions of the eyes
        return [leftEye, rightEye];

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
     * Build the vertex shader from templates files.
     * @return {string} - the code of the shader
     */
    async buildShaderVertex() {
        const response = await fetch("../shaders/vertex.glsl");
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
            for (const item of Object.values(list)) {
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
        for (const solid of this.listSolids) {
            await solid.glslBuildData();
        }
        for (const light of this.listLights) {
            await light.glslBuildData({maxLightDirs: this.maxLightDirs});
        }
        return {
            solids: this.listSolids,
            lights: this.listLights
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
            {file: 'shaders/header.glsl', data: header},
            {file: this.geom.shader, data: undefined},
            {file: 'shaders/geometry/commons.glsl', data: undefined},
            {file: 'shaders/items/abstract.glsl', data: undefined},
            {file: 'shaders/background.glsl', data: blocks},
            {file: 'shaders/setup.glsl', data: setup},
            {file: 'shaders/subgroup.glsl', data: this.subgroup},
            {file: 'shaders/sdf.glsl', data: items},
            {file: 'shaders/scene.glsl', data: items},
            {file: 'shaders/raymarch.glsl', data: undefined},
            {file: 'shaders/lighting.glsl', data: Object.assign({maxLightDirs: this.maxLightDirs},items)},
            {file: 'shaders/main.glsl', data: undefined}
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
        const keyboardController = this.gui.add(this.params, 'keyboard', {
            QWERTY: 'us',
            AZERTY: 'fr'
        }).name("Keyboard");

        let self = this;
        keyboardController.onChange(function (value) {
            self.setKeyboard(value);
        });
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
     * Init
     * Setup the general WebGL machinery via Three.js
     * Create a simple scene with a screen and an orthographic camera
     * Setup the shaders
     */
    async init() {
        // setup the camera
        this._camera = new PerspectiveCamera(this.params.fov, window.innerWidth / window.innerHeight, 0.0001, 5);
        this._camera.position.set(0, 0, 0);
        this._cameraNewPosition.copy(this._camera.position);
        this._camera.lookAt(0, 0, -1);
        this._camera.layers.enable(1);


        // build the scene with a single screen
        this._scene = new Scene();
        const geometry = new SphereBufferGeometry(2, 60, 40);
        // sphere eversion !
        geometry.scale(1, 1, -1);
        const materialLeft = new ShaderMaterial({
            uniforms: this.params._uniformsLeft,
            vertexShader: await this.buildShaderVertex(),
            fragmentShader: await this.buildShaderFragment(),
            transparent: true
        });
        const materialRight = new ShaderMaterial({
            uniforms: this.params._uniformsRight,
            vertexShader: await this.buildShaderVertex(),
            fragmentShader: await this.buildShaderFragment(),
            transparent: true
        });
        this._horizonLeft = new Mesh(geometry, materialLeft);
        this._horizonRight = new Mesh(geometry, materialRight);
        this._horizonLeft.layers.set(1);
        this._horizonRight.layers.set(2);
        this._scene.add(this._horizonLeft);
        this._scene.add(this._horizonRight);

        this.appendTitle();
        this.initUI();
        this.initStats();
        this.addEventListeners();
    }

    /**
     * Update with the keyboard the position and rotation of the camera
     * The rest of the scene and geometry will follow the camera.
     * @param {number} deltaTime - The time between the current and the next position
     */
    updateManual(deltaTime) {
        //console.log(this._keyboardDirs.translation.toLog());
        const deltaPosition = this._keyboardDirs.translation
            .clone()
            .multiplyScalar(this.params.speedTranslation * deltaTime)
            .applyMatrix4(this._camera.matrixWorld);
        const translation = new Matrix4().makeTranslation(deltaPosition.x, deltaPosition.y, deltaPosition.z);
        //console.log(translation.toLog());
        this._camera.applyMatrix4(translation);

        const deltaRotation = new Quaternion().setFromAxisAngle(
            this._keyboardDirs.rotation,
            0.5 * this.params.speedRotation * deltaTime
        );
        this._camera.quaternion.multiply(deltaRotation);
        this._camera.updateProjectionMatrix();
    }

    /**
     * Update the Three.js scene (moving the horizon sphere with the camera)
     * And the position in the geometry (passed to the shader).
     */
    updateScene() {
        this._cameraOldPosition.copy(this._cameraNewPosition);
        this._cameraNewPosition = new Vector3().setFromMatrixPosition(this._camera.matrixWorld);
        this._horizonLeft.position.copy(this._cameraNewPosition);
        this._horizonRight.position.copy(this._cameraNewPosition);

        const deltaPosition = new this.geom.Vector().subVectors(this._cameraNewPosition, this._cameraOldPosition);
        this.params.position.flow(deltaPosition);
        this.params.eyePosition = this.getEyePositions();
    }

    /**
     * Animates the simulation
     */
    animate() {
        if (!this._renderer.xr.isPresenting) {
            const deltaTime = this._clock.getDelta();
            this.updateManual(deltaTime);
        }
        this.updateScene();
        this._renderer.render(this._scene, this._camera);
        this.stats.update();
    }

    /**
     * Wrap together initialization and animation
     * @return {Promise<void>}
     */
    async run() {
        // initialize the scene
        await this.init();
        // because of the VR, the animation loop is declared with setAnimationLoop,
        // see https://threejs.org/docs/#manual/en/introduction/How-to-create-VR-content
        let self = this;
        this._renderer.setAnimationLoop(function () {
            self.animate()
        });
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
     * Action when the info key is down
     * @param {KeyboardEvent} event
     */
    onInfos(event) {
        const action = this._keyboardBinding[event.key];
        if (action === ACTION_CODES.INFOS) {
            event.preventDefault();
            console.log(this._camera);
            // console.log("position", this._camera.position.toLog());
            console.log("matrixWorld 0", this._camera.matrixWorld);
            // console.log("matrixWorldInverse", this._camera.matrixWorldInverse.toLog());
            // console.log("matrix", this._camera.matrix.toLog());
            // console.log("projectionMatrix", this._camera.projectionMatrix.toLog());

            this._camera.updateWorldMatrix(false, false);
            console.log(this._camera);
            // console.log("position", this._camera.position.toLog());

            console.log("matrixWorld 0", this._camera.matrixWorld);
            let matrix = this._camera.matrixWorld.clone();
            console.log("matrixWorld 2", matrix);

            let res = '\r\n';
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    if (j !== 0) {
                        res = res + ",\t";
                    }
                    res = res + matrix.elements[i + 4 * j];
                }
                res = res + "\r\n";
            }

            console.log("matrixWorld 1", res);

            // console.log("matrixWorldInverse", this._camera.matrixWorldInverse.toLog());
            // console.log("matrix", this._camera.matrix.toLog());
            // console.log("projectionMatrix", this._camera.projectionMatrix.toLog());
        }
    }


    /**
     * Action when a key is up or down
     * @param {KeyboardEvent} event
     */
    onKey(event) {
        if (this._keyboardBinding.hasOwnProperty(event.key)) {
            event.preventDefault();
            const action = this._keyboardBinding[event.key];

            const control = this._keyboardControls[action];
            const dirs = this._keyboardDirs;
            let sign;
            if (event.type === "keydown") {
                if (control.active) {
                    return;
                }
                control.active = true;
                sign = 1;
            }
            if (event.type === "keyup") {
                if (!control.active) {
                    return;
                }
                control.active = false;
                sign = -1;
            }
            switch (action) {
                case ACTION_CODES.ROTATE_X_POS:
                    dirs.rotation.x = dirs.rotation.x + sign;
                    break;
                case ACTION_CODES.ROTATE_X_NEG:
                    dirs.rotation.x = dirs.rotation.x - sign;
                    break;
                case ACTION_CODES.ROTATE_Y_POS:
                    dirs.rotation.y = dirs.rotation.y + sign;
                    break;
                case ACTION_CODES.ROTATE_Y_NEG:
                    dirs.rotation.y = dirs.rotation.y - sign;
                    break;
                case ACTION_CODES.ROTATE_Z_POS:
                    dirs.rotation.z = dirs.rotation.z + sign;
                    break;
                case ACTION_CODES.ROTATE_Z_NEG:
                    dirs.rotation.z = dirs.rotation.z - sign;
                    break;
                case ACTION_CODES.TRANSLATE_X_POS:
                    dirs.translation.x = dirs.translation.x + sign;
                    break;
                case ACTION_CODES.TRANSLATE_X_NEG:
                    dirs.translation.x = dirs.translation.x - sign;
                    break;
                case ACTION_CODES.TRANSLATE_Y_POS:
                    dirs.translation.y = dirs.translation.y + sign;
                    break;
                case ACTION_CODES.TRANSLATE_Y_NEG:
                    dirs.translation.y = dirs.translation.y - sign;
                    break;
                case ACTION_CODES.TRANSLATE_Z_POS:
                    dirs.translation.z = dirs.translation.z + sign;
                    break;
                case ACTION_CODES.TRANSLATE_Z_NEG:
                    dirs.translation.z = dirs.translation.z - sign;
                    break;
            }

        }
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
        document.addEventListener(
            "keydown",
            function (event) {
                self.onKey(event);
            }
        );
        document.addEventListener(
            "keydown",
            function (event) {
                self.onInfos(event);
            }
        );
        document.addEventListener(
            "keyup",
            function (event) {
                self.onKey(event);
            }
        );
    }

}


export {
    Thurston
}
