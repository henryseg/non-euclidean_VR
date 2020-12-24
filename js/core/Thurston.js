import {GUI} from "../lib/dat.gui.module.js";
import Stats from "../lib/stats.module.js";
import {FlyControls} from "../controls/FlyControls.js";
import {Clock, Color} from "../lib/three.module.js";

import {bind} from "../utils.js";

import {Camera, Renderer, Scene} from "./General.js";
import {Mono} from "../commons/stereos/mono/Mono.js";


/**
 * @class
 *
 *
 * @classdesc
 * A combination of all main parts of the API. It can be used to quickly create scenes
 */
export class Thurston {
    subgroup;
    params = {};

    /**
     * Constructor.
     * @param {Object} geom - the underlying geometry
     * @param {Subgroup} subgroup - the discrete subgroup
     * @param {Object} params - additional parameters including
     * - {string} keyboard - the type of keyboard (french, american, etc)
     */
    constructor(geom, subgroup, params = {}) {
        /**
         * The underlying geometry
         * @type {Object}
         */
        this.geom = geom;
        /**
         * The underlying subgroup
         * @type {Subgroup}
         */
        this.subgroup = subgroup;
        /**
         * Parameters of the Thurston object
         * @type {Object}
         */
        this.params = {}
        this.setParams(params);

        /**
         * A callback called at each frame
         * @type {Function}
         */
        this.callback = undefined;

        /**
         * The non-euclidean camera
         * @type {Camera}
         */
        this.camera = new Camera({subgroup: this.subgroup});
        /**
         * The non-euclidean scene
         * @type {Scene}
         */
        this.scene = new Scene();
        /**
         * The stereo mode (here mono)
         * @type {Mono}
         */
        this.stereo = new Mono();
        /**d
         * The non-euclidean renderer
         * @type {Renderer}
         */
        this.renderer = new Renderer(this.geom, this.subgroup, this.camera, this.scene, this.stereo);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(new Color(0, 0, 0.2), 1);
        document.body.appendChild(this.renderer.domElement);


        // event listener
        const _onWindowResize = bind(this, this.onWindowResize);
        window.addEventListener("resize", _onWindowResize, false);

        /**
         * The keyboard controls
         * @type {FlyControls}
         * @private
         */
        this.flyControls = new FlyControls(
            this.camera,
            this.renderer.domElement,
            this.params.keyboard
        );

        /**
         * A clock to measure the time between two call of animate
         * @type {Clock}
         * @private
         */
        this.clock = new Clock();

        /**
         * The performance stats
         * @type {Stats}
         */
        this.stats = undefined;
        this.initStats();


        /**
         * The graphical user interface
         * @type {GUI}
         */
        this.gui = undefined;
        this.initGUI();
    }

    /**
     * Set the value of the parameters.
     * To be used in the constructor.
     * @param {Object} params - the parameters
     */
    setParams(params) {
        /**
         * The keyboard used by FlyControls
         * @type {string}
         */
        this.params.keyboard = params.keyboard !== undefined ? params.keyboard : 'us';
    }


    /**
     * Initialize the graphic user interface
     * @return {Thurston} the current Thurston object
     */
    initGUI() {
        this.gui = new GUI();
        this.gui.close();
        this.gui.add({
            help: function () {
                window.open('https://github.com/henryseg/non-euclidean_VR');
            }
        }, 'help').name("Help/About");
        const keyboardController = this.gui.add(this.flyControls, 'keyboard', {
            QWERTY: 'us',
            AZERTY: 'fr'
        }).name("Keyboard");

        keyboardController.onChange = bind(this.flyControls, this.flyControls.setKeyboard)
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
     * Shortcut to add objects to the scene.
     * @param {...(Solid|Light)} obj - the objects to add
     */
    add(obj) {
        this.scene.add(/**@type {(Solid|Light)} */...arguments);
    }

    /**
     * Action when the window is resized.
     * @param {UIEvent} event
     */
    onWindowResize(event) {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix();
    }


    /**
     * animation function
     */
    animate() {
        const delta = this.clock.getDelta();
        if(this.callback !== undefined){
            this.callback();
        }
        this.flyControls.update(delta);

        this.renderer.render();
        this.stats.update();
    }


    /**
     * Build the renderer and run the animation.
     */
    run() {
        // building there renderer
        this.renderer.build();
        const _animate = bind(this, this.animate);
        this.renderer.setAnimationLoop(_animate);
    }
}