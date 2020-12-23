import {
    Color,
    Mesh,
    Scene as ThreeScene,
    ShaderMaterial,
    SphereBufferGeometry,
    WebGLRenderer
} from "../../lib/three.module.js";

import {ShaderBuilder} from "../ShaderBuilder.js";

import vertex from "./shaders/vertex.js";
import constants from "./shaders/constants.js";
import commons1 from "../geometry/shaders/commons1.js";
import commons2 from "../geometry/shaders/commons2.js";
import raymarch from "./shaders/raymarch.js";

/**
 * @class
 *
 * @classdesc
 * Non-euclidean renderer.
 * Takes as input the non-euclidean camera and scene and makes some magic.
 * It should not be confused with the Three.js WebGLRenderer it relies on.
 */
export class Renderer {

    /**
     * Constructor.
     * @param {Object} geom - the underlying geometry
     * @param {Subgroup} subgroup - the underlying subgroup
     * @param {Camera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Stereo} stereo - the stereo mode
     * @param {Object} params - parameters for the underlying Three.js renderer
     */
    constructor(geom, subgroup, camera, scene, stereo, params = {}) {
        /**
         * The underlying geometry.
         * @type{Object}
         */
        this.geom = geom;
        /**
         * The underlying subgroup
         * @type {Subgroup}
         */
        this.subgroup = subgroup;
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
         * Stereo mode
         * @type {Stereo}
         */
        this.stereo = stereo;

        /**
         * The underlying Three.js renderer
         * @type {WebGLRenderer}
         * @private
         */
        this._threeRenderer = new WebGLRenderer(params);
        /**
         * The underlying Three.js scene
         * Not to be confused with the non-euclidean scene.
         * @type {ThreeScene}
         * @private
         */
        this._threeScene = new ThreeScene();
        /**
         * The horizon sphere on which is drawn the non-euclidean geometry.
         * @type {Mesh}
         * @private
         */
        this._horizon = undefined;
        /**
         * Builder for the fragment shader.
         * @type {ShaderBuilder}
         * @private
         */
        this._fragmentBuilder = new ShaderBuilder();
    }

    /**
     * Shortcut to set the pixel ratio of the underlying Three.js renderer.
     * See Three.js doc.
     * @param {number} value
     */
    setPixelRatio(value) {
        this._threeRenderer.setPixelRatio(value);
    }

    /**
     * Shortcut to set the size of the underlying Three.js renderer.
     * See Three.js doc.
     * @param {number} width
     * @param {number} height
     * @param {boolean} updateStyle
     */
    setSize(width, height, updateStyle = true) {
        this._threeRenderer.setSize(width, height, updateStyle);
    }

    /**
     * Shortcut to set the clear color of the underlying Three.js renderer.
     * See Three.js doc.
     * @param {Color} color
     * @param {number} alpha
     */
    setClearColor(color, alpha) {
        this._threeRenderer.setClearColor(color, alpha);
    }

    /**
     * Shortcut to set the animation loop of the underlying Three.js renderer.
     * See Three.js doc.
     * @param {Function} callback
     */
    setAnimationLoop(callback) {
        this._threeRenderer.setAnimationLoop(callback);
    }

    /**
     * Shortcut to the DOM element of the underlying Three.js renderer.
     * See Three.js doc.
     * @return {HTMLCanvasElement}
     */
    get domElement() {
        return this._threeRenderer.domElement;
    }

    /**
     * Build the vertex shader
     */
    vertexShader() {
        return vertex;
    }

    /**
     * Build the fragment shader
     */
    buildFragmentShader() {

        // constants
        this._fragmentBuilder.addChunk(constants);
        // geometry
        this._fragmentBuilder.addChunk(this.geom.shader1);
        this._fragmentBuilder.addChunk(commons1);
        this._fragmentBuilder.addChunk(this.geom.shader2);
        this._fragmentBuilder.addChunk(commons2);

        // subgroup/quotient orbifold
        this.subgroup.shader(this._fragmentBuilder);

        // camera
        this.camera.shader(this._fragmentBuilder)

        // scene
        this.scene.shader(this._fragmentBuilder);

        // stereo mode
        this.stereo.shader(this._fragmentBuilder);

        // ray-march and main
        this._fragmentBuilder.addChunk(raymarch);
    }

    /**
     * Build the Three.js scene with the non-euclidean shader.
     */
    build() {
        // The lag that may occurs when we move the sphere to chase the camera can be the source of noisy movement.
        // We put a very large sphere around the user, to minimize this effect.
        const geometry = new SphereBufferGeometry(1000, 60, 40);
        // sphere eversion !
        geometry.scale(1, 1, -1);

        this.buildFragmentShader();
        const material = new ShaderMaterial({
            uniforms: this._fragmentBuilder.uniforms,
            vertexShader: this.vertexShader(),
            fragmentShader: this._fragmentBuilder.code,
        });
        this._horizon = new Mesh(geometry, material);
        this._horizon.layers.set(1);
        this._threeScene.add(this._horizon);

        return this;
    }

    checkShader() {
        console.log(this._fragmentBuilder.code);
    }

    /**
     * Render the non-euclidean scene.
     * The method `build` should be called before.
     */
    render() {
        this._threeRenderer.render(this._threeScene, this.camera['_threeCamera']);
    }

}