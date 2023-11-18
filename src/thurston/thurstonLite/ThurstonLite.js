import {Clock, Color} from "three";
import {GUI} from "dat.gui";
import Stats from "stats";

import {
    FlyControls,
    bind,
    BasicRenderer,
    Scene,
    SphereCamera,
    ExpFog
} from "3ds";

/**
 *
 * @classdesc
 * A combination of all main parts of the API. It can be used to quickly create scenes
 */
export class ThurstonLite {

    /**
     * Constructor.
     * @param {TeleportationSet} set - the teleportation set
     * @param {Object} params - additional parameters including
     * - {string} keyboard - the type of keyboard (french, american, etc)
     */
    constructor(set, params = {}) {

        /**
         * A callback called at each frame
         * @type {Function}
         */
        this.callback = undefined;

        const fog = new ExpFog(new Color(0, 0, 0), 0.07);
        /**
         * Non-euclidean renderer for basic renderer
         * @type {BasicRenderer}
         */
        this.renderer = new BasicRenderer(
            params.camera !== undefined ? params.camera : new SphereCamera({set: set}),
            new Scene({fog: fog}),
            {}
        );
        this.setPixelRatio(window.devicePixelRatio);
        this.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(new Color(0, 0, 0.2), 1);
        document.body.appendChild(this.renderer.domElement);

        // event listener
        const _onWindowResize = bind(this, this.onWindowResize);
        window.addEventListener("resize", _onWindowResize, false);

        /**
         * The keyboard controls to fly in the scene
         * @type {FlyControls}
         * @protected
         */
        this.flyControls = new FlyControls(
            this.camera
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
     * Shortcut to access the camera
     * @return {Camera}
     */
    get camera() {
        return this.renderer.camera;
    }

    set camera(camera) {
        this.renderer.camera = camera;
    }

    /**
     * Shortcut to access the scene
     * @return {Scene}
     */
    get scene() {
        return this.renderer.scene;
    }

    set scene(scene) {
        this.renderer.scene = scene;
    }

    /**
     * Shortcut to access the teleportation set
     * @return {TeleportationSet}
     */
    get set(){
        return this.camera.position.set;
    }

    setPixelRatio(value) {
        this.renderer.setPixelRatio(value);
    }

    setSize(width, height) {
        this.renderer.setSize(width, height);
    }


    /**
     * Initialize the graphic user interface
     * @return {ThurstonLite} the current Thurston object
     */
    initGUI() {
        this.gui = new GUI();
        this.gui.close();
        this.gui.add({
            help: function () {
                window.open('https://3-dimensional.space');
            }
        }, 'help').name("Help/About");


        // controls for the camera
        const cameraGUI = this.gui.addFolder('Camera');
        // cameraGUI.add(this.camera, 'fov', 45, 120)
        //     .name('Field of view');
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
        this.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }


    /**
     * animation function
     */
    animate() {
        const delta = this.clock.getDelta();

        this.flyControls.update(delta);
        this.renderer.render();
        if (this.callback !== undefined) {
            this.callback();
        }

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
        this.renderer.threeRenderer.setAnimationLoop(_animate);
    }
}