import {
    Color,
    Scene as ThreeScene,
    WebGLRenderer
} from "../../lib/threejs/build/three.module.js";


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
export class AbstractRenderer {

    /**
     * Constructor.
     * @param {Object} geom - the underlying geometry
     * @param {TeleportationSet} set - the underlying teleportation set
     * @param {BasicCamera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the Thurston part of the render. For the moment includes
     * @param {WebGLRenderer|Object} threeRenderer - either a Three.js renderer or the parameters to build it
     * - {boolean} postprocess - Gamma and Tone correction
     */
    constructor(geom, set, camera, scene, params = {}, threeRenderer = {}) {
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
         * If the passed argument is already a WebGLRenderer, we directly use it,
         * otherwise, we build a WebGLRenderer from the passed parameters.
         * @type {WebGLRenderer}
         */
        this.threeRenderer = threeRenderer.constructor.name === 'WebGLRenderer' ? threeRenderer : new WebGLRenderer(threeRenderer);

        /**
         * Number of time the light rays bounce
         * @type {number}
         */
        this.maxBounces = params.maxBounces !== undefined ? params.maxBounces : 0;
        /**
         * Add post processing to the final output
         * @type {Boolean}
         */
        this.postProcess = params.postProcess !== undefined ? params.postProcess : false;

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
        throw new Error('AbstractRenderer: this method is not implemented');
    }

    /**
     * Render the non-euclidean scene.
     * The method `build` should be called before.
     * @abstract
     */
    render() {
        throw new Error('AbstractRenderer: this method is not implemented');
        // this.threeRenderer.render(this.threeScene, this.camera.threeCamera);
    }
}