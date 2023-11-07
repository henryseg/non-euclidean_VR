import {OrthographicCamera, Matrix4} from "three";
import {RelPosition} from "../../../geometry/General.js";

import struct from "./shaders/struct.glsl";
import mapping from "./shaders/mapping.glsl";

/**
 * @class
 *
 * @classdesc
 * Camera in the non-euclidean scene, meant to record videos.
 * Suitable only with a flat screen.
 */
export class FlatScreenCamera {

    /**
     * Constructor.
     * @param {Object} parameters - the parameters of the camera.
     * These parameters are
     * - {number} minDist - the minimal distance we ray-march
     * - {number} maxDist - the maximal distance we ray-march
     * - {number} maxSteps - the maximal number of steps during the ray-marching
     * - {number} safetyDist - in case an object is at the same place as the camera,
     *      we always initially march a distance safetyDist,
     *      no matter what the SDFs return
     * - {number} threshold - the threshold to stop the ray-marching
     * - {TeleportationSet} set - the underlying subgroup of the geometry (to create the position)
     */
    constructor(parameters) {

        /**
         * The underlying Three.js camera
         * @type {OrthographicCamera}
         */
        this.threeCamera = new OrthographicCamera(
            -1,
            1,
            1,
            -1,
            0,
            1
        );
        this.threeCamera.position.set(0, 0, 0);
        this.threeCamera.lookAt(0, 0, -1);

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
         * Safety distance, to avoid collision with objects attached to the camera
         * @type {number}
         */
        this.safetyDist = parameters.safetyDist !== undefined ? parameters.safetyDist : 0;
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
         * Vertical field of view (in degrees)
         * Default value is the same as in three.js
         * @type {number}
         */
        this.fov = parameters.fov !== undefined ? parameters.fov : 50;
        /**
         * Position of the camera
         * @type {RelPosition}
         */
        this.position = new RelPosition(parameters.set);
    }

    /**
     * Vertical field of view in radians
     * @return {number}
     */
    get fovRadians() {
        return Math.PI * this.fov / 180;
    }


    get isFlatScreenCamera() {
        return true;
    }


    /**
     * Matrix of the underlying Three.js camera in the virtual euclidean scene
     * @type {Matrix4}
     */
    get matrix() {
        return this.threeCamera.matrixWorld;
    }

    /**
     * Shortcut to update the projection matrix of the underlying Three.js camera
     */
    updateProjectionMatrix() {
        this.threeCamera.updateProjectionMatrix();
    }


    /**
     * build the GLSL code needed to declare the camera
     * @param {ShaderBuilder} shaderBuilder - the shader builder
     */
    shader(shaderBuilder) {
        shaderBuilder.addClass('Camera', struct);
        shaderBuilder.addUniform('camera', 'Camera', this);
        shaderBuilder.addChunk(mapping);
    }
}