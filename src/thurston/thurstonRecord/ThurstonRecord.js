import {Clock, Color, Vector2} from "three";

import {
    bind,
    BasicRenderer, Scene,
    FlatCamera,
    ExpFog,
    FlyControls
} from "3ds";

/**
 * @class
 *
 *
 * @classdesc
 * A combination of all main parts of the API. It can be used to quickly create scenes
 * Useful to record videos with CCapture.
 * CCapture should be inserted as a global variable in a script
 */
export class ThurstonRecord {

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
            params.camera !== undefined ? params.camera : new FlatCamera({set: set}),
            new Scene({fog: fog}),
            {}
        );

        this.setPixelRatio(window.devicePixelRatio);
        this.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(new Color(0, 0, 0.2), 1);
        document.body.appendChild(this.renderer.domElement);

        /**
         * Resolution of the recording (in pixels)
         * By default 16:9 screen with 4K resolution
         * https://fr.wikipedia.org/wiki/4K
         * @type {Vector2}
         */
        this.recordSize = params.recordSize !== undefined ? params.recordSize : new Vector2(3840, 2160);

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
        this.autostart = false;
        this.capture = undefined;

        const _onKeyDown = bind(this, this.onKeyDown);
        window.addEventListener('keydown', _onKeyDown, false);

        /**
         * A clock to measure the time between two call of animate
         * @type {Clock}
         * @protected
         */
        this.clock = new Clock();

        /**
         * A clock that is reset everytime the recording starts
         * @type {Clock}
         */
        this.recordClock = new Clock()
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
        const _onWindowResize = bind(this, this.onWindowResize);
        window.removeEventListener('resize', _onWindowResize);
        this.setSize(this.recordSize.x, this.recordSize.y);
        this.capture = new CCapture({
            framerate: 24,
            format: 'jpg'
        });
        this.capture.start();
        this.recordClock.start();
        this.isRecordOn = true;
    }

    recordStop() {
        console.log('stop');
        this.capture.stop();
        this.capture.save();
        this.isRecordOn = false;
        this.setSize(window.innerWidth, window.innerHeight);
        const _onWindowResize = bind(this, this.onWindowResize);
        window.addEventListener("resize", _onWindowResize, false);
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
        if (this.autostart && this.capture === undefined) {
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