import {
    Color,
    Scene as ThreeScene,
    WebGLRenderer
} from "../../lib/three.module.js";

/**
 * @class
 * @abstract
 *
 * @classdesc
 * Non-euclidean renderer.
 * Takes as input the non-euclidean camera and scene and makes some magic.
 * It should not be confused with the Three.js WebGLRenderer it relies on.
 * Abstract class with the code common to all renderers.
 */
export class Renderer {

    /**
     * Constructor.
     * @param {Object} geom - the underlying geometry
     * @param {TeleportationSet} set - the underlying teleportation set
     * @param {BasicCamera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} threeJSParams - parameters for the underlying Three.js renderer
     * @param {Object} thurstonParams - parameters for the Thurston part of the render. For the moment includes
     * - {boolean} postprocess - Gamma and Tone correction
     */
    constructor(geom, set, camera, scene, threeJSParams = {}, thurstonParams = {}) {
        /**
         * The underlying geometry.
         * @type{Object}
         */
        this.geom = geom;
        /**
         * The underlying subgroup
         * @type {TeleportationSet}
         */
        this.set = set;
        /**
         * Non-euclidean camera
         * @type {BasicCamera}
         */
        this.camera = camera;
        /**
         * Non-euclidean scene
         * @type {Scene}
         */
        this.scene = scene;

        /**
         * The underlying Three.js renderer
         * @type {WebGLRenderer}
         * @protected
         */
        this.threeRenderer = new WebGLRenderer(threeJSParams);

        /**
         * Parameters for the Thurston part of the render
         * @type {Object}
         */
        this.thurstonParams = thurstonParams;
        if (thurstonParams.postprocess === undefined) {
            this.thurstonParams.postprocess = false;
        }
        /**
         * The underlying Three.js scene
         * Not to be confused with the non-euclidean scene.
         * @type {ThreeScene}
         */
        this.threeScene = new ThreeScene();
    }

    /**
     * Shortcut to set the pixel ratio of the underlying Three.js renderer.
     * See Three.js doc.
     * @param {number} value
     */
    setPixelRatio(value) {
        this.threeRenderer.setPixelRatio(value);
    }

    /**
     * Shortcut to set the size of the underlying Three.js renderer.
     * See Three.js doc.
     * @param {number} width
     * @param {number} height
     * @param {boolean} updateStyle
     */
    setSize(width, height, updateStyle = true) {
        this.threeRenderer.setSize(width, height, updateStyle);
    }

    /**
     * Shortcut to set the clear color of the underlying Three.js renderer.
     * See Three.js doc.
     * @param {Color} color
     * @param {number} alpha
     */
    setClearColor(color, alpha) {
        this.threeRenderer.setClearColor(color, alpha);
    }

    /**
     * Shortcut to set the animation loop of the underlying Three.js renderer.
     * See Three.js doc.
     * @param {Function} callback
     */
    setAnimationLoop(callback) {
        this.threeRenderer.setAnimationLoop(callback);
    }

    /**
     * Shortcut to the DOM element of the underlying Three.js renderer.
     * See Three.js doc.
     * @return {HTMLCanvasElement}
     */
    get domElement() {
        return this.threeRenderer.domElement;
    }

    /**
     * Build the Three.js scene with the non-euclidean shader.
     * @abstract
     */
    build() {
        throw new Error('AbstractRenderer: this method is not implemented')
    }

    /**
     * Render the non-euclidean scene.
     * The method `build` should be called before.
     */
    render() {
        this.threeRenderer.render(this.threeScene, this.camera.threeCamera);
    }
}