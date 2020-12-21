import {PerspectiveCamera} from "../../lib/three.module.js";
import {RelPosition} from "../geometry/General.js";
import trivial from "../../commons/subgroups/trivial.js";
import struct from "./shaders/struct.js";

/**
 * @class
 *
 * @classdesc
 * Camera in the non-euclidean scene.
 * It should not be confused with the Three.js camera in the virtual euclidean scene
 */
export class Camera {

    /**
     * Constructor.
     * @param {Object} parameters - the parameters of the camera.
     * This parameters are
     * - {number} fov - the field of view
     * - {number} minDist - the minimal distance we ray-march
     * - {number} maxDist - the maximal distance we ray-march
     * - {number} maxSteps - the maximal number of steps during the ray-marching
     * - {number} threshold - the threshold to stop the ray-marching
     * - {Subgroup} subgroup - the underlying subgroup of the geometry (to create the position)
     */
    constructor(parameters) {

        /**
         * The underlying Three.js camera
         * @type {PerspectiveCamera}
         * @private
         */
        this._threeCamera = new PerspectiveCamera(
            parameters.fov !== undefined ? parameters.fov : 70,
            window.innerWidth / window.innerHeight,
            0.01,
            2000
        );
        this._threeCamera.position.set(0, 0, 0);
        this._threeCamera.lookAt(0, 0, -1);
        this._threeCamera.layers.enable(1);

        /**
         * Minimal distance we ray-march
         * @type {number}
         */
        this.minDist = parameters.minDist !== undefined ? parameters.minDist : 0;
        /**
         * Maximal distance we ray-march
         * @type {number}
         */
        this.maxDist = parameters.maxDist !== undefined ? parameters.maxDist : 50;
        /**
         * Maximal number of steps during the ray-marching
         * @type {number}
         */
        this.maxSteps = parameters.maxSteps !== undefined ? parameters.maxSteps : 100;
        /**
         * Threshold to stop the ray-marching
         * @type {number}
         */
        this.threshold = parameters.threshold !== undefined ? parameters.threshold : 0.0001;
        /**
         * Position of the camera
         * @type {RelPosition}
         */
        this.position = new RelPosition(
            parameters.subgroup !== undefined ? parameters.subgroup : trivial
        );
    }

    /**
     * Shortcut to reset the aspect of the underlying Three.js camera
     * @param {number} value
     */
    set aspect(value) {
        this._threeCamera.aspect = value;
    }

    /**
     * Shortcut to reset the field of view of the underlying Three.js camera
     * @param {number} value
     */
    set fov(value) {
        this._threeCamera.fov = value;
    }

    /**
     * Matrix of the underlying Three.js camera in the virtual euclidean scene
     * @type {Matrix4}
     */
    get matrix() {
        return this._threeCamera.matrixWorld;
    }

    /**
     * Shortcut to update the projection matrix of the underlying Three.js camera
     */
    updateProjectionMatrix() {
        this._threeCamera.updateProjectionMatrix();
    }

    /**
     * build the GLSL code needed to declare the camera
     * @param {ShaderBuilder} shaderBuilder
     */
    shader(shaderBuilder) {
        shaderBuilder.addChunk(struct);
        shaderBuilder.addUniform('camera', 'Camera', this);
    }
}