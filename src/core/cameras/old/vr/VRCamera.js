import {Vector3} from "three";

import {Vector} from "../../../geometry/General.js";
import {BasicCamera} from "../basic/BasicCamera.js";
import {LEFT, RIGHT} from "../../../../constants.js";

import struct from "./shaders/struct.glsl";
import mapping from "./shaders/mapping.glsl";




/**
 * @class
 *
 * @classdesc
 * Stereographic camera.
 * Used for VR.
 * The position of the camera corresponds to the midpoint between the two eyes.
 */
export class VRCamera extends BasicCamera {

    /**
     * Constructor.
     * @param {Object} parameters - the parameters of the camera.
     * These parameters are
     * - {number} fov - the field of view
     * - {number} minDist - the minimal distance we ray-march
     * - {number} maxDist - the maximal distance we ray-march
     * - {number} maxSteps - the maximal number of steps during the ray-marching
     * - {number} threshold - the threshold to stop the ray-marching
     * - {number} safetyDist - in case an object is at the same place as the camera,
     *      we always initially march a distance safetyDist,
     *      no matter what the SDFs return
     * - {TeleportationSet} set - the underlying subgroup of the geometry (to create the position)
     * - {number} ipDist - the interpupillary distance
     */
    constructor(parameters) {
        super(parameters);
        /**
         * True if stereo is on
         * @type {boolean}
         */
        this.isStereoOn = false;
        /**
         * **Half** the interpupillary distance
         * @return {number}
         */
        this.ipDist = parameters.ipDist !== undefined ? parameters.ipDist : 0.03200000151991844;
        /**
         * Two fake copies of the cameras meant to be passed to the shader as uniforms.
         * @type {Object[]}
         */
        this.fakeCameras = [];
        for (const side in [LEFT, RIGHT]) {
            this.fakeCameras[side] = {
                fov: this.fov,
                minDist: this.minDist,
                maxDist: this.maxDist,
                maxSteps: this.maxSteps,
                safetyDist: this.safetyDist,
                threshold: this.threshold,
                position: this.position.clone(),
                matrix: this.matrix,
            }
        }
    }

    /**
     * True if stereo is off
     * @type {boolean}
     */
    get isStereoOff() {
        return !this.isStereoOn
    }

    /**
     * Turn the stereo mode on or off
     */
    switchStereo() {
        this.isStereoOn = !this.isStereoOn;
    }

    /**
     * Update the fake camera position.
     * Shift the left and right camera from the current position using parallel transport.
     */
    updateFakeCamerasPosition() {
        this.fakeCameras[LEFT].position.copy(this.position);
        this.fakeCameras[RIGHT].position.copy(this.position);

        if (this.isStereoOn) {
            // if we are in VR mode, the position corresponds to the right eye
            // we offset the left eye, by flowing in the left direction
            // we have to be careful that left and right are meant in the point of view of the camera.
            const dir = new Vector(1, 0, 0)
                .multiplyScalar(2 * this.ipDist)
                .applyMatrix4(this.matrix)
                .negate();
            this.fakeCameras[LEFT].position.flow(dir);


            // // if we are in VR mode we offset the position of the left and right eyes
            // // to that end, we flow the position along the left / right direction
            // // we have to be careful that left and right are meant in the point of view of the camera.
            // const rightDir = new Vector(1, 0, 0)
            //     .multiplyScalar(this.ipDist)
            //     .applyMatrix4(this.matrix);
            // const leftDir = rightDir.clone().negate();
            // this.fakeCameras[RIGHT].position.flow(rightDir);
            // this.fakeCameras[LEFT].position.flow(leftDir);
        }
    }

    /**
     * In VR mode the position of the Three.js camera (in the Euclidean Three.js scene)
     * is directly controlled by the VR headset.
     * This method update the position of the observer in the geometry accordingly.
     * Every displacement is the Three.js scene is interpreted as a tangent vector.
     * We move the observer by following the geodesic in this direction.
     * The method also update the left and right eyes positions.
     * The method should be called at each frame.
     *
     * @return{Function}
     */
    get chaseThreeCamera() {
        if (this._chaseThreeCamera === undefined) {
            const oldThreePosition = new Vector();

            /**
             * @private
             */
            this._chaseThreeCamera = function () {
                // if we are in VR mode, the position corresponds to the right eye
                // this should not  be an issue though.
                // indeed we only care of the relative displacement.
                const newThreePosition = new Vector().setFromMatrixPosition(this.matrix);
                const deltaPosition = new Vector().subVectors(newThreePosition, oldThreePosition);
                this.position.flow(deltaPosition);
                this.updateFakeCamerasPosition();
                oldThreePosition.copy(newThreePosition);
            };
        }
        return this._chaseThreeCamera;
    }

    shader(shaderBuilder) {
        throw new Error('StereoCamera: for stereographic cameras, use sidedShader instead');
    }

    /**
     * build the GLSL code needed to declare the camera
     * @param {ShaderBuilder} shaderBuilder - the shader builder
     * @param {number} side - the side (left of right) (used for stereographic camera)
     */
    sidedShader(shaderBuilder, side) {
        shaderBuilder.addClass('VRCamera', struct);
        shaderBuilder.addUniform('camera', 'VRCamera', this.fakeCameras[side]);
        shaderBuilder.addChunk(mapping);
    }


}