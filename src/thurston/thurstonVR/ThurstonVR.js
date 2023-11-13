import * as WebXRPolyfill from "webxr-polyfill";
import Stats from "stats";
import {GUI} from "dat.gui";
import {Clock, Color} from "three";
import {XRControllerModelFactory} from "three/addons";
// import {XRControllerModelFactory} from "three/addons/webxr/XRControllerModelFactory.js";

import {
    bind,
    Scene, VRRenderer,
    VRCamera,
    MoveVRControls, DragVRControls, FlyControls,
    ExpFog
} from "3ds";


/**
 * @class
 *
 *
 * @classdesc
 * A combination of all main parts of the API. It can be used to quickly create scenes
 */
export class ThurstonVR {

    /**
     * Constructor.
     * @param {TeleportationSet} set - the teleportation set
     * @param {Object} params - additional parameters including
     * - {string} keyboard - the type of keyboard (french, american, etc)
     */
    constructor(set, params = {}) {
        // loading the polyfill if WebXR is not supported
        new WebXRPolyfill.default();


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

        /**
         * The non-euclidean camera
         * @type {VRCamera}
         */
        this.camera = params.camera !== undefined ? params.camera : new VRCamera({set: this.set});

        const fog = new ExpFog(new Color(0, 0, 0), 0.07);
        /**
         * The non-euclidean scene
         * @type {Scene}
         */
        this.scene = new Scene({fog: fog});

        /**
         * The non-euclidean renderer
         * @type {VRRenderer}
         */
        this.renderer = new VRRenderer(this.camera, this.scene, {}, {antialias: true});
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


        const controllerModelFactory = new XRControllerModelFactory();

        const controllerGrip0 = this.renderer.xr.getControllerGrip(0);
        const model0 = controllerModelFactory.createControllerModel(controllerGrip0);
        controllerGrip0.add(model0);
        this.camera.threeScene.add(controllerGrip0);

        const controllerGrip1 = this.renderer.xr.getControllerGrip(1);
        const model1 = controllerModelFactory.createControllerModel(controllerGrip1);
        controllerGrip1.add(model1);
        this.camera.threeScene.add(controllerGrip1);

        const controller0 = this.renderer.xr.getController(0);
        this.camera.threeScene.add(controller0);
        const controller1 = this.renderer.xr.getController(1);
        this.camera.threeScene.add(controller1);

        /**
         * Moving in the scene with the VR controller
         * @protected
         * @type {MoveVRControls}
         */
        this.VRControlsMove = new MoveVRControls(this.camera.position, controller0);
        /**
         * Rotating the scene with the VR controller
         * @protected
         * @type {DragVRControls}
         */
        this.VRControlsDrag = new DragVRControls(this.camera.position, controller1);
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
                window.open('https://3-dimensional.space');
            }
        }, 'help').name("Help/About");

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
        this.VRControlsMove.update(delta);
        this.VRControlsDrag.update(delta);

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