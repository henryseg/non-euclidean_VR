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
    Quaternion, Matrix4
} from "./lib/three.module.js";

import {
    mustache
} from "./lib/mustache.mjs";

import {
    GUI
} from "./lib/dat.gui.module.js"


/**
 * @constant {number}
 * @default Code for a translation in the positive x-direction
 */
const MOVE_X_POS = 0;
/**
 * @constant {number}
 * @default Code for a translation in the negative x-direction
 */
const MOVE_X_NEG = 1;
/**
 * @constant {number}
 * @default Code for a positive rotation around the x-axis
 */
const ROTATE_X_POS = 2;
/**
 * @constant {number}
 * @default Code for a negative rotation around the x-axis
 */
const ROTATE_X_NEG = 3;
/**
 * @constant {number}
 * @default Code for a translation in the positive y-direction
 */
const MOVE_Y_POS = 4;
/**
 * @constant {number}
 * @default Code for a translation in the negative y-direction
 */
const MOVE_Y_NEG = 5;
/**
 * @constant {number}
 * @default Code for a positive rotation around the y-axis
 */
const ROTATE_Y_POS = 6;
/**
 * @constant {number}
 * @default Code for a negative rotation around the y-axis
 */
const ROTATE_Y_NEG = 7;
/**
 * @constant {number}
 * @default Code for a translation in the positive z-direction
 */
const MOVE_Z_POS = 8;
/**
 * @constant {number}
 * @default Code for a translation in the negative z-direction
 */
const MOVE_Z_NEG = 9;
/**
 * @constant {number}
 * @default Code for a positive rotation around the z-axis
 */
const ROTATE_Z_POS = 10;
/**
 * @constant {number}
 * @default Code for a negative rotation around the z-axis
 */
const ROTATE_Z_NEG = 11;


/**
 * Keyboard commands.
 * Each main entry correspond to a keyboard type (American, French, etc).
 * @const
 * @type {{fr: {}, us: {}}}
 */
const keyboard = {
    'us': {
        65: {
            action: ROTATE_Y_POS,
            active: false
        }, // a
        68: {
            action: ROTATE_Y_NEG,
            active: false
        }, // d
        87: {
            action: ROTATE_X_POS,
            active: false
        }, // w
        83: {
            action: ROTATE_X_NEG,
            active: false
        }, // s
        81: {
            action: ROTATE_Z_POS,
            active: false
        }, // q
        69: {
            action: ROTATE_Z_NEG,
            active: false
        }, // e
        38: {
            action: MOVE_Z_NEG,
            active: false
        }, // up
        40: {
            action: MOVE_Z_POS,
            active: false
        }, // down
        37: {
            action: MOVE_X_NEG,
            active: false
        }, // left
        39: {
            action: MOVE_X_POS,
            active: false
        }, // right
        222: {
            action: MOVE_Y_POS,
            active: false
        }, // single quote
        191: {
            action: MOVE_Y_NEG,
            active: false
        }, // fwd slash
    },
    'fr': {
        81: {
            action: ROTATE_Y_POS,
            active: false
        }, // q
        68: {
            action: ROTATE_Y_NEG,
            active: false
        }, // d
        90: {
            action: ROTATE_X_POS,
            active: false
        }, // z
        83: {
            action: ROTATE_X_NEG,
            active: false
        }, // s
        65: {
            action: ROTATE_Z_POS,
            active: false
        }, // a
        69: {
            action: ROTATE_Z_NEG,
            active: false
        }, // e
        38: {
            action: MOVE_Z_NEG,
            active: false
        }, // up
        40: {
            action: MOVE_Z_POS,
            active: false
        }, // down
        37: {
            action: MOVE_X_NEG,
            active: false
        }, // left
        39: {
            action: MOVE_X_POS,
            active: false
        }, // right
        165: {
            action: MOVE_Y_POS,
            active: false
        }, // ù
        61: {
            action: MOVE_Y_NEG,
            active: false
        }, // =
    }
};


/**
 * @class
 *
 * @classdesc
 * Object used to create a scene.
 *
 * @property {Object} geometry - the underlying geometry
 * @property lattice - the lattice used for local scenes
 * @property {Object} options - the general options of the scene
 * @property {Object} solids - the list of solids in the scene
 * @property {Object} lights - the list of lights in the scene
 * @property {Object} uniforms - the list of uniform passed to the shader
 * @property {Vector2} resolution - the resolution of the windows
 * @property {Position} position - position of the observer
 * @property {Position} leftPosition - position of the left eye (relative to the observer's position)
 * @property {Position} rightPosition - position of the right eye (relative to the observer's position)
 * @property {Isometry} cellBoost - isometry moving you in the correct cell
 * @property {Isometry} invCellBoost - isometry moving you back from the correct cell
 *
 * @todo Decide the list of available options
 */
class Thurston {

    /**
     * Create an instance dedicated to build a scene in the prescribed geometry.
     * @param {Object} geom - a module handing the relevant geometry
     * @param {Object} options - a list of options
     * @todo Check if the geometry satisfies all the requirement?
     */
    constructor(geom, options = {}) {
        // setup the geometry (as a module)
        this.geom = geom;

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

        this.options = this.defaultOptions();
        for (const type in this.options) {
            for (const property in this.options[type]) {
                if (this.options[type].hasOwnProperty(property) && options.hasOwnProperty(property)) {
                    this.options[type][property] = options[property];
                }
            }
        }

        // define all the remaining properties
        // (maybe not needed in JS, but good practice I guess)
        // some of these properties are setup via an asynchronous procedure, which cannot take place in a constructor
        this.gui = undefined;
        this.guiInfo = undefined;
        this._stats = undefined;

        this._uniforms = undefined;
        this._resolution = undefined;
        this._renderer = undefined;
        this._scene = undefined;
        this._camera = undefined;

        this._keyboardControls = keyboard[this.options.pureJS.keyboard];
        this._keyboardDirs = {
            translation: new this.geom.Vector(),
            rotation: new this.geom.Vector(),
        };
        this._clockPosition = new Clock();


    }

    defaultOptions() {
        return {
            pureJS: {
                keyboard: 'us',
                speedTranslation: 0.2,
                speedRotation: 0.4,
            },
            consts: {
                maxDirs: 3,
            },
            uniforms: {}
        };
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
     * @return {Thurston}
     *
     * @todo Decide how the lattice should be defined
     */
    setLattice(data) {
        return this;
    }

    /**
     * Set the given options.
     * @param {array} options - global options for the scene
     * @return {Thurston}
     */
    setOptions(options) {
        return this;
    }

    /**
     * Set the given option.
     * @param {string} key - key of the option
     * @param {Object} value - the value of the option
     * @return {Thurston}
     */
    setOption(key, value) {
        return this;
    }

    /**
     * Adding an item to the scene.
     * @param{Item} item - the item to add
     * @return {Thurston}
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
     * @return {Thurston}
     */
    addItems(items) {
        for (const item of items) {
            this.addItem(item);
        }
        return this
    }


    /**
     * add the name of the geometry to the title of the page
     * @return {Thurston}
     */
    appendTitle() {
        const title = document.querySelector('title');
        title.append(' - ' + this.geom.name);
        return this;
    }


    /**
     * Setup the uniforms which are passed to the shader
     */
    setupUniforms() {
        const rawData = this.serialize();
        this._uniforms = {
            maxMarchingSteps: {
                type: "int",
                value: 100
            },
            minDist: {
                type: "float",
                value: 0.
            },
            maxDist: {
                type: "float",
                value: 30.
            },
            marchingThreshold: {
                type: "float",
                value: 0.001
            },
            fov: {
                type: "float",
                value: 90.
            },
            stereo: {
                type: "bool",
                value: false
            },
            resolution: {
                type: "vec2",
                value: this._resolution
            },
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
    }

    /**
     * Build the vertex shader from templates files.
     * @return {string} - the code of the shader
     */
    async buildShaderVertex() {
        const response = await fetch("../shaders/vertex.glsl");
        return await response.text();
    }

    buildShaderDataUniforms() {
        const res = [];
        let uniform
        for (const name in this._uniforms) {
            if (this._uniforms.hasOwnProperty(name)) {
                uniform = {
                    name: name,
                    type: this._uniforms[name].type
                }
                res.push(uniform);
            }
        }
        return res;
    }

    buildShaderDataHeader() {
        const res = {}
        Object.assign(
            res,
            this.options.consts,
            {uniforms: this.buildShaderDataUniforms()}
        );
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
        //console.log(fShader);

        return fShader;
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


    initUI() {
        this.guiInfo = {
            help: function () {
                window.open('https://github.com/henryseg/non-euclidean_VR');
            },
            keyboard: this.options.pureJS.keyboard
        };
        this.gui = new GUI();
        this.gui.close();
        this.gui.add(this.guiInfo, 'help').name("Help/About");
        const keyboardController = this.gui.add(this.guiInfo, 'keyboard', {
            QWERTY: 'us',
            AZERTY: 'fr'
        }).name("Keyboard");

        let self = this;
        keyboardController.onChange(function(value){
            self.options.pureJS.keyboard = value;
            self._keyboardControls = keyboard[value];
        });

    }

    initStats() {
        this._stats = new Stats();
        this._stats.showPanel(0);
        document.body.appendChild(this._stats.dom);
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
        this._resolution = new Vector2(window.innerWidth, window.innerHeight).multiplyScalar(window.devicePixelRatio);

        // setup the camera
        this._camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

        // build the scene with a single screen
        this._scene = new Scene();
        const geometry = new PlaneBufferGeometry(2, 2);
        this.setupUniforms();
        let material = new ShaderMaterial({
            uniforms: this._uniforms,
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
        this._stats.update();
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
            .multiplyScalar(this.options.pureJS.speedTranslation * deltaTime);
        this.position.flow(deltaPosition);

        const deltaRotation = new Quaternion().setFromAxisAngle(
            this._keyboardDirs.rotation,
            0.5 * this.options.pureJS.speedRotation * deltaTime
        );
        this.position.applyFacing(new Matrix4().makeRotationFromQuaternion(deltaRotation));

        const raw = this.position.serialize();
        this._uniforms.boostRawA.value = raw[0];
        this._uniforms.boostRawB.value = raw[1];
    }

    /**
     * Action when the window is resized
     * @param {Event} event
     */
    onWindowResize(event) {
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._uniforms.resolution.value
            .set(window.innerWidth, window.innerHeight)
            .multiplyScalar(window.devicePixelRatio);
    }

    onKey(event) {
        if (this._keyboardControls.hasOwnProperty(event.keyCode)) {
            event.preventDefault();
            const control = this._keyboardControls[event.keyCode];
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
            switch (control.action) {
                case ROTATE_X_POS:
                    dirs.rotation.x = dirs.rotation.x + sign;
                    break;
                case ROTATE_X_NEG:
                    dirs.rotation.x = dirs.rotation.x - sign;
                    break;
                case ROTATE_Y_POS:
                    dirs.rotation.y = dirs.rotation.y + sign;
                    break;
                case ROTATE_Y_NEG:
                    dirs.rotation.y = dirs.rotation.y - sign;
                    break;
                case ROTATE_Z_POS:
                    dirs.rotation.z = dirs.rotation.z + sign;
                    break;
                case ROTATE_Z_NEG:
                    dirs.rotation.z = dirs.rotation.z - sign;
                    break;
                case MOVE_X_POS:
                    dirs.translation.x = dirs.translation.x + sign;
                    break;
                case MOVE_X_NEG:
                    dirs.translation.x = dirs.translation.x - sign;
                    break;
                case MOVE_Y_POS:
                    dirs.translation.y = dirs.translation.y + sign;
                    break;
                case MOVE_Y_NEG:
                    dirs.translation.y = dirs.translation.y - sign;
                    break;
                case MOVE_Z_POS:
                    dirs.translation.z = dirs.translation.z + sign;
                    break;
                case MOVE_Z_NEG:
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
