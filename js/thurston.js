/**
 * @module Thurston
 *
 * @description
 * Module used to define and render a scene in one of the eight Thurston geometries.
 */

import {
    WebGLRenderer,
    Scene,
    OrthographicCamera,
    PlaneBufferGeometry,
    ShaderMaterial,
    Mesh,
    Vector2,
    Clock,
    Quaternion,
    Matrix4
} from "./lib/three.module.js";

import {
    mustache
} from "./lib/mustache.mjs";

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
    ROTATE_Z_NEG: 11
}


/**
 * Keyboard commands.
 * Each main entry correspond to a keyboard type (American, French, etc).
 * @const
 */
const KEYBOARD_BINDINGS = {
    'us': {
        65: ACTION_CODES.ROTATE_Y_POS, // a
        68: ACTION_CODES.ROTATE_Y_NEG, // d
        87: ACTION_CODES.ROTATE_X_POS,// w
        83: ACTION_CODES.ROTATE_X_NEG, // s
        81: ACTION_CODES.ROTATE_Z_POS, // q
        69: ACTION_CODES.ROTATE_Z_NEG, // e
        38: ACTION_CODES.TRANSLATE_Z_NEG, // up
        40: ACTION_CODES.TRANSLATE_Z_POS,// down
        37: ACTION_CODES.TRANSLATE_X_NEG, // left
        39: ACTION_CODES.TRANSLATE_X_POS,// right
        222: ACTION_CODES.TRANSLATE_Y_POS,// single quote
        191: ACTION_CODES.TRANSLATE_Y_NEG,// fwd slash
    },
    'fr': {
        81: ACTION_CODES.ROTATE_Y_POS, // q
        68: ACTION_CODES.ROTATE_Y_NEG,// d
        90: ACTION_CODES.ROTATE_X_POS, // z
        83: ACTION_CODES.ROTATE_X_NEG, // s
        65: ACTION_CODES.ROTATE_Z_POS,// a
        69: ACTION_CODES.ROTATE_Z_NEG,// e
        38: ACTION_CODES.TRANSLATE_Z_NEG,// up
        40: ACTION_CODES.TRANSLATE_Z_POS,// down
        37: ACTION_CODES.TRANSLATE_X_NEG, // left
        39: ACTION_CODES.TRANSLATE_X_POS, // right
        165: ACTION_CODES.TRANSLATE_Y_POS, // ù
        61: ACTION_CODES.TRANSLATE_Y_NEG, // =
    }
};


/**
 * Code for the way a property can be passed to the shader
 * @const
 */
const SHADER_PASS = {
    NONE: 0,
    CONSTANT: 1,
    UNIFORM: 2,
}

/**
 * List of available parameters
 * Only the parameters that come with a default value are options accepted in the constructor of Thurston.
 * Each options that is not passed to the constructor is set to its default value.
 * When the default value is an object, the function default should create a new instance of this object.
 * (Hence the need to use a function to generate the default value of the option.)
 * Each parameter has also tags to say how its value should be passed to the shader, and under which type.
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
        shaderPass: SHADER_PASS.UNIFORM,
        shaderType: 'float'
    },
    resolution: {
        shaderPass: SHADER_PASS.UNIFORM,
        shaderType: 'vec2'
    },
    stereo: {
        shaderPass: SHADER_PASS.UNIFORM,
        shaderType: 'bool'
    }
};

const handlerParams = {
    set: function (target, prop, value, receiver) {
        if (prop === 'uniforms') {
            throw new Error("The uniforms cannot be reassigned.");
        }
        if (!(prop in PARAMS)) {
            throw new Error(`The parameter ${prop} is not supported.`);
        }
        target[prop] = value;
        // if needed we update the uniforms
        if (PARAMS[prop].shaderPass === SHADER_PASS.UNIFORM) {
            target.uniforms[prop] = {
                type: PARAMS[prop].shaderType,
                value: target[prop]
            };
        }

        return true;
    }
}


/**
 * @class
 *
 * @classdesc
 * Class used to create a scene in the specified geometry
 *
 * @property {Object} geometry - the underlying geometry (in the form of an imported module)
 * @property lattice - the lattice used for local scenes
 * @property {Object} options - the general options of the scene
 * @property {Object} solids - the list of solids in the scene
 * @property {Object} lights - the list of lights in the scene
 * @property {Object} _uniforms - the list of uniform passed to the shader
 * @property {Vector2} _resolution - the resolution of the windows
 * @property {Position} position - position of the observer
 * @property {Position} leftPosition - position of the left eye (relative to the observer's position)
 * @property {Position} rightPosition - position of the right eye (relative to the observer's position)
 * @property {Isometry} cellBoost - isometry moving you in the correct cell
 * @property {Isometry} invCellBoost - isometry moving you back from the correct cell
 *
 * @todo Decide how to represent a lattice
 */
class Thurston {
    /**
     * Create an instance dedicated to build a scene in the prescribed geometry.
     * Property that are not setup yet, but will be used later are defined as `undefined`.
     * (Maybe not needed in JS, but good practice I guess.)
     * @param {Object} geom - a module handing the relevant geometry
     * @param {Object} options - a list of options. See defaultOptions for the list of available options.
     * @todo Check if the geometry satisfies all the requirement?
     */
    constructor(geom, options = {}) {
        // setup the geometry (as a module)
        this.geom = geom;

        // setup all the options
        this.params = new Proxy({uniforms: {}}, handlerParams);
        for (const property in PARAMS) {
            if ('default' in PARAMS[property]) {
                if (property in options) {
                    this.params[property] = options[property];
                } else {
                    this.params[property] = PARAMS[property].default();
                }
            }
        }
        // complete the set of parameters
        this.params.resolution = new Vector2();
        this.params.stereo = false;

        // setup the initial positions
        this.position = new this.geom.Position();
        this.leftPosition = new this.geom.Position();
        this.rightPosition = new this.geom.Position();
        this.cellBoost = new this.geom.Isometry();
        this.invCellBoost = new this.geom.Isometry();

        // init the list of items in the scene
        this._solids = {};
        this._lights = {};
        // first available id of an item (to be incremented when adding items)
        this._id = 0;

        this._renderer = undefined;
        this._scene = undefined;
        this._camera = undefined;

        // some of these properties are setup via an asynchronous procedure, which cannot take place in a constructor
        this.gui = undefined;
        this.guiInfo = undefined;
        this.stats = undefined;

        // setup the controls for the keyboard
        // fix the default keyboard binding
        // its value can be changed in the UI
        this._keyboardBinding = KEYBOARD_BINDINGS[this.params.keyboard];
        // setup the controls for keyboard action
        // used to handle an active tag, in case the user hold a key down.
        this._keyboardControls = {};
        for (const action of Object.values(ACTION_CODES)) {
            this._keyboardControls[action] = {active: false};
        }
        // setup the translation/rotation "direction" used when the user moves via the keyboard
        this._keyboardDirs = {
            translation: new this.geom.Vector(),
            rotation: new this.geom.Vector(),
        };
        this._clockPosition = new Clock();
    }


    get listSolids() {
        return Object.values(this._solids);
    }

    get listLights() {
        return Object.values(this._lights);
    }

    /**
     * Setup the lattice used for the local scene.
     * @param data - some data describing the lattice
     * @return {Thurston} the current Thurston object
     *
     * @todo Decide how the lattice should be defined
     */
    setLattice(data) {
        return this;
    }

    /**
     * Set the given options.
     * @param {Object} options - a list of option
     * @return {Thurston} the current Thurston object
     */
    setOptions(options) {
        for (const key in options) {
            if (options.hasOwnProperty(key)) {
                this.setOption(key, options[key]);
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
    setOption(key, value) {
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
     * @param{Array} items - the list of items to add
     * @return {Thurston} the current Thurston object
     */
    addItems(items) {
        for (const item of items) {
            this.addItem(item);
        }
        return this
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
     * Serialize all the positions and boost in a form that can be passed to the shader
     * @return {array} the output in an array with three entries:
     * - a list of 5 Matrix4 (the part A of the isometries position, left/right position, cell and invCell).
     * - a list of 5 floating numbers (the part B of the isometries position, left/right position, cell and invCell).
     * - a list of 3 Matrix4 (the facing, left and right facings).
     */
    serialize() {
        const rawA = [];
        const rawB = [];
        const facings = [];
        let i = 0;
        let raw;
        const data = [
            this.position,
            this.leftPosition,
            this.rightPosition,
            this.cellBoost,
            this.invCellBoost
        ]
        for (const pos of data) {
            raw = pos.serialize();
            rawA[i] = raw[0];
            rawB[i] = raw[1];
            if (i < 3) {
                facings[i] = raw[2];
            }
            i = i + 1;
        }
        return [rawA, rawB, facings];
    }

    /**
     * Setup the uniforms which are passed to the shader
     */
    setupUniforms() {
        const rawData = this.serialize();
        Object.assign(this.params.uniforms,
            this.uniforms = {
                boostRawA: {
                    type: "mat4",
                    value: rawData[0][0]
                },
                leftBoostRawA: {
                    type: "mat4",
                    value: rawData[0][1]
                },
                rightBoostRawA: {
                    type: "mat4",
                    value: rawData[0][2]
                },
                cellBoostRawA: {
                    type: "mat4",
                    value: rawData[0][3]
                },
                invCellBoostRawA: {
                    type: "mat4",
                    value: rawData[0][4]
                },
                boostRawB: {
                    type: "float",
                    value: rawData[1][0]
                },
                leftBoostRawB: {
                    type: "float",
                    value: rawData[1][1]
                },
                rightBoostRawB: {
                    type: "float",
                    value: rawData[1][2]
                },
                cellBoostRawB: {
                    type: "float",
                    value: rawData[1][3]
                },
                invCellBoostRawB: {
                    type: "float",
                    value: rawData[1][4]
                },
                facing: {
                    type: "mat4",
                    value: rawData[2][0]
                },
                leftFacing: {
                    type: "mat4",
                    value: rawData[2][1]
                },
                rightFacing: {
                    type: "mat4",
                    value: rawData[2][2]
                },
            }
        );
    }

    /**
     * Build the vertex shader from templates files.
     * @return {string} - the code of the shader
     */
    async buildShaderVertex() {
        const response = await fetch("../shaders/vertex.glsl");
        return await response.text();
    }


    buildShaderDataHeader() {
        const res = {constants: [], uniforms: []};
        for (const property in PARAMS) {
            if (PARAMS.hasOwnProperty(property)) {
                switch (PARAMS[property].shaderPass) {
                    case SHADER_PASS.CONSTANT:
                        res.constants.push({
                            name: property,
                            type: PARAMS[property].shaderType,
                            value: this.params[property]
                        });
                        break;
                    case SHADER_PASS.UNIFORM:
                        res.uniforms.push({
                            name: property,
                            type: PARAMS[property].shaderType
                        });
                        break;
                }
            }
        }
        res.uniforms.push(
            {name: 'boostRawA', type: 'mat4'},
            {name: 'leftBoostRawA', type: 'mat4'},
            {name: 'rightBoostRawA', type: 'mat4'},
            {name: 'cellBoostRawA', type: 'mat4'},
            {name: 'invCellBoostRawA', type: 'mat4'},
            {name: 'boostRawB', type: 'float'},
            {name: 'leftBoostRawB', type: 'float'},
            {name: 'rightBoostRawB', type: 'float'},
            {name: 'cellBoostRawB', type: 'float'},
            {name: 'invCellBoostRawB', type: 'float'},
            {name: 'facing', type: 'mat4'},
            {name: 'leftFacing', type: 'mat4'},
            {name: 'rightFacing', type: 'mat4'},
        )
        return res;
    }

    async buildShaderDataBackground() {
        const files = [];
        for (const list of [this._solids, this._lights]) {
            for (const item of Object.values(list)) {
                if (!files.includes(item.shaderSource)) {
                    files.push(item.shaderSource);
                }
            }
        }
        const blocks = [];
        let response;
        let xml
        const parser = new DOMParser();
        for (const file of files) {
            response = await fetch(file);
            xml = parser.parseFromString(await response.text(), 'application/xml');
            blocks.push(xml.querySelector('background').childNodes[0].nodeValue);
        }
        return {blocks: blocks};
    }

    async buildShaderDataItems() {
        for (const solid of this.listSolids) {
            await solid.glslBuildData();
        }
        for (const light of this.listLights) {
            await light.glslBuildData();
        }
        return {
            solids: this.listSolids,
            lights: this.listLights
        };
    }


    /**
     * Build the fragment shader from templates files.
     * @return {string} - the code of the shader
     */
    async buildShaderFragment() {
        const header = this.buildShaderDataHeader();
        const background = await this.buildShaderDataBackground();
        const items = await this.buildShaderDataItems();


        // A list of pairs (file, data)
        // - file is a path a a shader file
        // - data are the data passed to the template (if undefined, the file is just a plain GLSL file)
        const shaders = [
            {file: 'shaders/header.glsl', data: header},
            {file: this.geom.shader, data: undefined},
            {file: 'shaders/geometry/commons.glsl', data: undefined},
            {file: 'shaders/items/abstract.glsl', data: undefined},
            {file: 'shaders/background.glsl', data: background},
            {file: 'shaders/setup.glsl', data: items},
            {file: 'shaders/sdf.glsl', data: items},
            {file: 'shaders/scene.glsl', data: items},
            {file: 'shaders/raymarch.glsl', data: undefined},
            {file: 'shaders/lighting.glsl', data: items},
            {file: 'shaders/main.glsl', data: undefined}
        ];

        let response;
        let template;
        let fShader = "";
        for (const shader of shaders) {
            // load the file, render the template and append the result to the shader
            response = await fetch(shader.file);
            template = await response.text();
            if (shader.data === undefined) {
                fShader = fShader + template;
            } else {
                fShader = fShader + mustache.render(template, shader.data);
            }
        }
        // console.log(fShader);

        return fShader;
    }


    initUI() {
        this.guiInfo = {
            help: function () {
                window.open('https://github.com/henryseg/non-euclidean_VR');
            },
            keyboard: this.params.keyboard
        };
        this.gui = new GUI();
        this.gui.close();
        this.gui.add(this.guiInfo, 'help').name("Help/About");
        const keyboardController = this.gui.add(this.guiInfo, 'keyboard', {
            QWERTY: 'us',
            AZERTY: 'fr'
        }).name("Keyboard");

        let self = this;
        keyboardController.onChange(function (value) {
            self.params.keyboard = value;
            self._keyboardControls = KEYBOARD_BINDINGS[value];
        });

    }

    initStats() {
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
    }


    /**
     * Init
     * Setup the general WebGL machinery via Three.js
     * Create a simple scene with a screen and an orthographic camera
     * Setup the shaders
     */
    async init() {
        // setup the WebGL renderer
        this._renderer = new WebGLRenderer();
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this._renderer.domElement);
        this.params.resolution.set(window.innerWidth, window.innerHeight).multiplyScalar(window.devicePixelRatio);

        // setup the camera
        this._camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

        // build the scene with a single screen
        this._scene = new Scene();
        const geometry = new PlaneBufferGeometry(2, 2);
        this.setupUniforms();
        let material = new ShaderMaterial({
            uniforms: this.params.uniforms,
            vertexShader: await this.buildShaderVertex(),
            fragmentShader: await this.buildShaderFragment(),
            transparent: true
        });
        const mesh = new Mesh(geometry, material);
        this._scene.add(mesh);

        this.appendTitle();
        this.initUI();
        this.initStats();
        this.addEventListeners();
    }

    /**
     * Animates the simulation
     */
    animate() {
        let self = this;
        window.requestAnimationFrame(function () {
            self.animate();
        });

        this.updatePosition();
        this._renderer.render(this._scene, this._camera);
        this.stats.update();
    }

    async run() {
        await this.init();
        this.animate();
    }

    /**
     * Update the position of the observer
     */
    updatePosition() {
        const deltaTime = this._clockPosition.getDelta();

        const deltaPosition = this._keyboardDirs.translation
            .clone()
            .multiplyScalar(this.params.speedTranslation * deltaTime);
        this.position.flow(deltaPosition);

        const deltaRotation = new Quaternion().setFromAxisAngle(
            this._keyboardDirs.rotation,
            0.5 * this.params.speedRotation * deltaTime
        );
        this.position.applyFacing(new Matrix4().makeRotationFromQuaternion(deltaRotation));

        const raw = this.position.serialize();
        this.params.uniforms.boostRawA.value = raw[0];
        this.params.uniforms.boostRawB.value = raw[1];
    }

    /**
     * Action when the window is resized
     * @param {Event} event
     */
    onWindowResize(event) {
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this.params.resolution
            .set(window.innerWidth, window.innerHeight)
            .multiplyScalar(window.devicePixelRatio);
    }

    onKey(event) {
        if (this._keyboardBinding.hasOwnProperty(event.keyCode)) {
            event.preventDefault();
            const action = this._keyboardBinding[event.keyCode]
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
            false);
        document.addEventListener(
            "keydown",
            function (event) {
                self.onKey(event);
            }
        )
        document.addEventListener(
            "keyup",
            function (event) {
                self.onKey(event);
            }
        )
    }

}


export {
    Thurston
}
