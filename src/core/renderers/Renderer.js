import {
    Color, Vector2,
    WebGLRenderer
} from "three";


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
     * The first part of the geometry dependent shader.
     * @type{string}
     */
    static shader1 = undefined;
    /**
     * The second part of the geometry dependent shader.
     * @type{string}
     */
    static shader2 = undefined;

    /**
     * Constructor.
     * @param {Camera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the Thurston part of the render. For the moment includes
     * @param {WebGLRenderer|Object} threeRenderer - either a Three.js renderer or the parameters to build it
     * - {boolean} postprocess - Gamma and Tone correction
     */
    constructor(camera, scene, params = {}, threeRenderer = {}) {
        /**
         * Non-euclidean camera
         * @type {Camera}
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
        this.threeRenderer = threeRenderer.isWebGLRenderer ? threeRenderer : new WebGLRenderer(threeRenderer);
        /**
         * "Global" uniforms (i.e. values that will not depend on the objects in the scene)
         * A uniform is encoded by an object with two properties
         * `type` - a glsl type
         * `value` - the JS value.
         * @type {Object}
         */
        this.globalUniforms = params.globalUniforms !== undefined ? params.globalUniforms : {};

        if (this.globalUniforms.maxBounces === undefined) {
            this.globalUniforms.maxBounces = {type: 'int', value: 0}
        }
        this.globalUniforms.windowSize = {
            type: 'vec2',
            value: new Vector2(window.innerWidth, window.innerHeight)
        };
    }

    /**
     * Shortcut for the underlying teleportation set.
     * @return {TeleportationSet}
     */
    get set() {
        return this.camera.position.set;
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
        throw new Error('Renderer: this method is not implemented');
    }

    /**
     * Render the non-euclidean scene.
     * The method `build` should be called before.
     * @abstract
     */
    render() {
        throw new Error('Renderer: this method is not implemented');
        // this.threeRenderer.render(this.threeScene, this.camera.threeCamera);
    }
}