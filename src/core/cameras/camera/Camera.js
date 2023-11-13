import {
    Scene as ThreeScene
} from "three";

import {RelPosition} from "../../geometry/General.js";

/**
 * @abstract
 *
 * @classdesc
 * Camera in the non-euclidean scene.
 * It should not be confused with the Three.js camera in the virtual euclidean scene.
 * The minimal GLSL struct should contain
 * - minDist
 * - maxDist
 * - maxSteps
 * - threshold
 * - position
 * - matrix
 * The GLSL code needs to contain (after the declaration) a function `mapping`.
 * The role of this function is to map a point on the horizon sphere
 * to the initial direction to follow during the ray-marching.
 *
 * @todo Refactor the code to handle VR Camera properly.
 * All the properties should have a setter and a getter, update a JS Object passed as uniform to the shader
 * The VR Camera will duplicate the object for the other eye
 * The Object should be called in the shader builder via a method take the side as an optional argument.
 */
export class Camera {

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
         * The underlying Three.js camera.
         * It has to be implemented (through setThreeCamera) by classes extending Camera
         * @type {Camera}
         */
        this.threeCamera = undefined;
        /**
         * The underlying Three.js scene
         * It has to be implemented (through setThreeScene) by classes extending Camera
         * @type {Scene}
         */
        this.threeScene = new ThreeScene();

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
         * Position of the camera
         * @type {RelPosition}
         */
        this.position = new RelPosition(parameters.set);

        /**
         * Two fake copies of the cameras meant to be passed to the shader as uniforms.
         * Mostly for VR
         * @type {Object[]}
         */
        this.fakeCameras = [];

        this.setThreeCamera(parameters);
    }

    /**
     * Set up the Three.js camera compatible with the Three.js scene
     */
    setThreeCamera(parameters) {
        throw new Error("This method need be implemented.");
    }

    /**
     * Set up the Three.js scene compatible with the Three.js camera
     */
    setThreeScene() {
        throw new Error("This method need be implemented.");
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
     * Return the chunk of GLSL code defining the camera structure
     * The structure name should always be `Camera`
     * @abstract
     * @return {string}
     */
    static glslClass() {
        throw new Error('Generic: this function should be implemented');
    }

    /**
     * Return the chunk of GLSL code defining the mapping
     *
     *  - from the screen space in Three.js
     *  - to the tangent space to the camera in the geometry
     *
     * The structure name should always be `Camera`
     * @abstract
     * @return {string}
     */
    static glslMapping() {
        throw new Error('Generic: this function should be implemented');
    }


    /**
     * build the GLSL code needed to declare the camera
     * @param {ShaderBuilder} shaderBuilder - the shader builder
     * @param {number} side - the side (left of right) (used for stereographic camera)
     */
    shader(shaderBuilder, side = undefined) {
        shaderBuilder.addClass('Camera', this.constructor.glslClass());
        if(side === undefined){
            shaderBuilder.addUniform('camera', 'Camera', this);

        } else {
            shaderBuilder.addUniform('camera', 'Camera', this.fakeCameras[side]);
        }
        shaderBuilder.addChunk(this.constructor.glslMapping());

    }
}