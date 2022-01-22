import {GUI} from "../../../lib/dat.gui.module.js";
import Stats from "../../../lib/stats.module.js";
import {FlyControls} from "../../../controls/FlyControls.js";
import {Clock, Color, WebGLRenderer} from "../../../lib/threejs/build/three.module.js";

import {bind} from "../../../utils.js";

import {BasicCamera, BasicRenderer, PathTracerCamera, PathTracerRenderer, Scene} from "../../../core/General.js";
import {ExpFog} from "../../scenes/expFog/ExpFog.js";
import {PathTracerUI} from "./PathTracerUI.js";

import dialogBox from "./html/dialogBoxHTML.js";
import downloadButton from "./html/downloadButtonHTML.js";
import thurstonCSS from "./css/thurstonCSS.js";


/**
 * @class
 *
 *
 * @classdesc
 * A combination of all main parts of the API. It can be used to quickly create scenes
 */
export class Thurston {

    /**
     * Constructor.
     * @param {Object} geom - the underlying geometry
     * @param {TeleportationSet} set - the teleportation set
     * @param {Object} params - additional parameters including
     * - {string} keyboard - the type of keyboard (french, american, etc)
     */
    constructor(geom, set, params = {}) {
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
         * A callback called at each frame
         * @type {Function}
         */
        this.callback = undefined;


        const fog = new ExpFog(new Color(0, 0, 0), 0.07);
        /**
         * The non-euclidean scene
         * @type {Scene}
         */
        this.scene = new Scene({fog: fog});

        /**
         * The non-euclidean camera for the basic renderer
         * @type {BasicCamera}
         */
        this.camera = new BasicCamera({set: this.set});
        /**
         * The non-euclidean camera for the path tracer
         * @type {PathTracerCamera}
         */
        this.ptCamera = new PathTracerCamera({set: this.set});
        /**
         * Three.js renderer
         * @type {WebGLRenderer}
         */
        this.threeRenderer = new WebGLRenderer();
        this.threeRenderer.setClearColor(new Color(0, 0, 0.2), 1);
        document.body.appendChild(this.threeRenderer.domElement);

        /**
         * Non-euclidean renderer for basic renderer
         * @type {BasicRenderer}
         */
        this.renderer = new BasicRenderer(this.geom, this.set, this.camera, this.scene, {}, this.threeRenderer);
        /**
         * Non-euclidean renderer for path tracer
         * @type {PathTracerRenderer}
         */
        this.ptRenderer = new PathTracerRenderer(this.geom, this.set, this.ptCamera, this.scene, {}, this.threeRenderer);
        /**
         * The renderer we are currently using
         * @type {BasicRenderer|PathTracerRenderer}
         */
        this.currentRenderer = this.renderer;

        // set the renderer size
        this.setSize(window.innerWidth, window.innerHeight);
        // event listener
        this._onWindowResize = bind(this, this.onWindowResize);
        window.addEventListener('resize', this._onWindowResize, false);

        /**
         * The keyboard controls to fly in the scene
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

        /**
         * The UI for path tracing
         * @type {PathTracerUI}
         */
        this.pathTracerUI = undefined;

        this.onLoad();
    }


    onLoad() {
        const thurstonStyle = document.createElement('style');
        thurstonStyle.setAttribute('type', 'text/css');
        thurstonStyle.textContent = thurstonCSS.trim();
        document.head.appendChild(thurstonStyle);
        document.body.insertAdjacentHTML('beforeend', dialogBox);
        document.body.insertAdjacentHTML('beforeend', downloadButton);
    }

    setPixelRatio(value) {
        this.renderer.setPixelRatio(value);
        this.ptRenderer.setPixelRatio(value);
    }

    setSize(width, height) {
        this.renderer.setSize(width, height);
        this.ptRenderer.setSize(width, height);
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

    initPathTracerUI() {
        this.pathTracerUI = new PathTracerUI(this);
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
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }


    /**
     * Switch between the two renderer
     */
    switchRenderer() {
        if (this.currentRenderer.isBasicRenderer) {
            this.flyControls.pause();
            window.removeEventListener('resize', this._onWindowResize);
            this.ptCamera.position.copy(this.camera.position);
            this.ptRenderer.iFrame = 0;
            this.threeRenderer.setRenderTarget(this.ptRenderer.accReadTarget);
            this.threeRenderer.clear();
            this.currentRenderer = this.ptRenderer;
        } else {
            this.flyControls.restore();
            window.addEventListener('resize', this._onWindowResize);
            this.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.currentRenderer = this.renderer;
        }
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
        this.currentRenderer.render();
        this.stats.update();
    }

    /**
     * Build the renderer and run the animation.
     */
    run() {
        this.initStats();
        this.initGUI();
        this.initPathTracerUI();
        this.renderer.build();
        this.ptRenderer.build();
        const _animate = bind(this, this.animate);
        this.threeRenderer.setAnimationLoop(_animate);
    }
}