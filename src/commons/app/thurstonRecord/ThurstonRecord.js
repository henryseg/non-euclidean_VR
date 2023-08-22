import {Clock, Color} from "three";

import {FlyControls} from "../../../controls/keyboard/FlyControls.js";
import {bind} from "../../../utils.js";
import {FullDomCamera, FlatScreenRenderer, Scene} from "../../../core/General.js";
import {ExpFog} from "../../scenes/expFog/ExpFog.js";

/**
 * @class
 *
 *
 * @classdesc
 * A combination of all main parts of the API. It can be used to quickly create scenes
 * Useful to record videos with CCapture
 * CCapture should be inserted as a global variable in a script
 */
export class ThurstonRecord {

    /**
     * Constructor.
     * @param {string} shader1 - the first part of the geometry dependent shader
     * @param {string} shader2 - the second part of the geometry dependent shader
     * @param {TeleportationSet} set - the teleportation set
     * @param {Object} params - additional parameters including
     * - {string} keyboard - the type of keyboard (french, american, etc)
     */
    constructor(shader1, shader2, set, params = {}) {
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
         * @type {FullDomCamera}
         */
        this.camera = new FullDomCamera({set: this.set});

        /**
         * Non-euclidean renderer for basic renderer
         * @type {FlatScreenRenderer}
         */
        this.renderer = new FlatScreenRenderer(shader1, shader2, this.set, this.camera, this.scene, {});
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
         * Is the recording on or off
         * @type {boolean}
         */
        this.isRecordOn = false;
        this.capture = undefined;

        const _onKeyDown = bind(this, this.onKeyDown);
        window.addEventListener('keydown', _onKeyDown, false);

        /**
         * A clock to measure the time between two call of animate
         * @type {Clock}
         * @protected
         */
        this.clock = new Clock();
    }

    setPixelRatio(value) {
        this.renderer.setPixelRatio(value);
    }

    setSize(width, height) {
        this.renderer.setSize(width, height);
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

    recordStart() {
        console.log('start');
        this.capture = new CCapture({
            framerate: 60,
            format: 'jpg'
        });
        this.capture.start();
        this.isRecordOn = true;
    }

    recordStop() {
        console.log('stop');
        this.capture.stop();
        this.capture.save();
        this.isRecordOn = false;
    }

    onKeyDown(event) {
        if (event.key === 'r') {
            if (this.isRecordOn) {
                this.recordStop();
            } else {
                this.recordStart();
            }
        }
    }

    /**
     * animation function
     */
    animate() {
        if(this.capture === undefined){
            this.recordStart();
        }
        const delta = this.clock.getDelta();
        this.flyControls.update(delta);
        this.renderer.render();
        if (this.isRecordOn) {
            this.capture.capture(this.renderer.threeRenderer.domElement);
        }
        if (this.callback !== undefined) {
            this.callback();
        }
    }

    /**
     * Build the renderer and run the animation.
     */
    run() {
        this.renderer.build();
        const _animate = bind(this, this.animate);
        this.renderer.threeRenderer.setAnimationLoop(_animate);
    }
}