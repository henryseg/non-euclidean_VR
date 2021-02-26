import {GUI} from "../lib/dat.gui.module.js";
import Stats from "../lib/stats.module.js";
import {FlyControls} from "../controls/FlyControls.js";
import {Clock, Color} from "../lib/three.module.js";

import {bind} from "../utils.js";

import {BasicCamera, Scene} from "./General.js";
import {ExpFog} from "../commons/scenes/expFog/ExpFog.js";


/**
 * @class
 *
 *
 * @classdesc
 * A combination of all main parts of the API. It can be used to quickly create scenes
 */
export class AbstractThurston {

    /**
     * Constructor.
     * @param {Object} geom - the underlying geometry
     * @param {TeleportationSet} set - the teleportation set
     * @param {Function} cameraType - camera constructor
     * @param {Function} rendererType - renderer constructor
     * @param {Object} params - additional parameters including
     * - {string} keyboard - the type of keyboard (french, american, etc)
     */
    constructor(geom, set, cameraType, rendererType, params = {}) {
        /**
         * The underlying geometry
         * @type {Object}
         */
        this.geom = geom;
        /**
         * The underlying subgroup
         * @type {TeleportationSet}
         */
        this.set = set;
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
         * @type {BasicCamera}
         */
        this.camera = new cameraType({set: this.set});

        const fog = new ExpFog(new Color(0, 0, 0), 0.07);
        /**
         * The non-euclidean scene
         * @type {Scene}
         */
        this.scene = new Scene({fog: fog, maxBounces: params.maxBounces, background: params.background});

        /**
         * The non-euclidean renderer
         * @type {Renderer}
         */
        this.renderer = new rendererType(this.geom, this.set, this.camera, this.scene);
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
         * @protected
         */
        this.flyControls = new FlyControls(
            this.camera,
            params.keyboard !== undefined ? params.keyboard : 'us'
        );

        /**
         * A clock to measure the time between two call of animate
         * @type {Clock}
         * @protected
         */
        this.clock = new Clock();

        /**
         * The performance stats.
         * Setup when the renderer is built.
         * @type {Stats}
         */
        this.stats = undefined;

        /**
         * The graphical user interface.
         * Setup when the renderer is built.
         * @type {GUI}
         */
        this.gui = undefined;
    }

    /**
     * Set the value of the parameters.
     * To be used in the constructor.
     * @param {Object} params - the parameters
     */
    setParams(params) {
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
        this.gui.add(
            this.flyControls,
            'keyboard', {QWERTY: 'us', AZERTY: 'fr'}
        ).name("Keyboard");

        // controls for the camera
        const cameraGUI = this.gui.addFolder('Camera');
        cameraGUI.add(this.camera, 'fov', 45, 120)
            .name('Field of view');
        cameraGUI.add(this.camera, 'maxDist', 0, 100, 1)
            .name('Max distance');
        cameraGUI.add(this.camera, 'maxSteps', 20, 500, 1)
            .name('Max steps');
        cameraGUI.add(this.camera, 'threshold')
            .name('Threshold');

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
        if (this.callback !== undefined) {
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
        this.initStats();
        this.initGUI();
        this.renderer.build();
        const _animate = bind(this, this.animate);
        this.renderer.setAnimationLoop(_animate);
    }
}