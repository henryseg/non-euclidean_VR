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
    PerspectiveCamera,
    PlaneBufferGeometry,
    SphereBufferGeometry,
    ShaderMaterial,
    Mesh,
    Vector2,
    Vector3,
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
 * List of registered parameters
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
    },
    position: {
        shaderPass: SHADER_PASS.UNIFORM,
        shaderType: 'RelPosition'
    },
    leftPosition: {
        shaderPass: SHADER_PASS.UNIFORM,
        shaderType: 'Position'
    },
    rightPosition: {
        shaderPass: SHADER_PASS.UNIFORM,
        shaderType: 'Position'
    }
};


/**
 * This handler is designed to traps the setters or the field `params` in a `Thurston` object
 * Each time a setter is called to assign a property to `params` the handler does the following
 * - Check if the property belongs to `PARAMS` (the list of registered parameters)
 * - If this property is listed as a uniform in `PARAMS`, update the list of uniforms
 * @const
 */
const PARAMS_HANDLER = {
    set: function (target, prop, value) {
        // basic security checks.
        // the uniforms cannot be reassigned.
        if (prop === 'uniforms') {
            throw new Error("The uniforms cannot be reassigned.");
        }
        // only the declared parameters are accepted.
        if (!(prop in PARAMS)) {
            throw new Error(`The parameter ${prop} is not supported.`);
        }

        // regular update of the property
        target[prop] = value;

        // if needed we update the uniforms
        if (PARAMS[prop].shaderPass === SHADER_PASS.UNIFORM) {
            target._uniforms[prop] = {
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
        /**
         * The list of parameters of the object.
         * Interactions with `params` go through a proxy to automatically keep the list of uniforms up to date.
         * @type {Object}
         */
        this.params = new Proxy({_uniforms: {}}, PARAMS_HANDLER);
        for (const property in PARAMS) {
            if ('default' in PARAMS[property]) {
                if (property in params) {
                    this.params[property] = params[property];
                } else {
                    this.params[property] = PARAMS[property].default();
                }
            }
        }
        // complete the set of parameters
        this.params.resolution = new Vector2();
        this.params.stereo = false;

        // setup the initial positions
        this.params.position = new this.geom.RelPosition(this.subgroup);
        this.params.leftPosition = new this.geom.Position();
        this.params.rightPosition = new this.geom.Position();

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

        // first available id of an item (to be incremented when adding items)
        this._id = 0;

        // the Three.js WebGL renderer
        this._renderer = undefined;
        // The Three.js scene
        this._scene = undefined;
        // The Three.js camera
        this._camera = undefined;

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
            translation: new this.geom.Vector(),
            rotation: new this.geom.Vector(),
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
            await light.glslBuildData();
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
            {file: 'shaders/lighting.glsl', data: items},
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
        // setup the WebGL renderer
        this._renderer = new WebGLRenderer();
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this._renderer.domElement);
        this.params.resolution.set(window.innerWidth, window.innerHeight).multiplyScalar(window.devicePixelRatio);

        // setup the camera
        //this._camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this._camera = new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.0001, 5);
        this._camera.lookAt(new Vector3(0,0,-1));
        this._camera.position.set(0,0,0);

        // build the scene with a single screen
        this._scene = new Scene();
        // const geometry = new PlaneBufferGeometry(2, 2);
        const geometry = new SphereBufferGeometry( 2, 60, 40 );
        // sphere eversion !
        geometry.scale(1, 1, -1);
        let material = new ShaderMaterial({
            uniforms: this.params._uniforms,
            vertexShader: await this.buildShaderVertex(),
            fragmentShader: await this.buildShaderFragment(),
            transparent: true
        });
        //console.log(this.params.uniforms);
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
        const deltaTime = this._clock.getDelta();
        this.updatePosition(deltaTime);
        //console.log(this.params.position.point.coords);
        this._renderer.render(this._scene, this._camera);
        this.stats.update();
    }

    /**
     * Wrap together initialization and animation
     * @return {Promise<void>}
     */
    async run() {
        await this.init();
        this.animate();
    }

    /**
     * Update the position of the observer
     * @param {number} deltaTime - The time between the current and the next position
     */
    updatePosition(deltaTime) {
        const deltaPosition = this._keyboardDirs.translation
            .clone()
            .multiplyScalar(this.params.speedTranslation * deltaTime);
        this.params.position.flow(deltaPosition);

        const deltaRotation = new Quaternion().setFromAxisAngle(
            this._keyboardDirs.rotation,
            0.5 * this.params.speedRotation * deltaTime
        );
        this.params.position.applyFacing(new Matrix4().makeRotationFromQuaternion(deltaRotation));
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

    /**
     * Action when a key is up or down
     * @param {Event} event
     */
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
