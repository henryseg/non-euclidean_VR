import {SphereCamera} from "../sphereCamera/SphereCamera.js";
import {Vector} from "../../geometry/Vector.js";

import {LEFT, RIGHT} from "../../constants.js";
import {Mesh, ShaderMaterial, SphereGeometry} from "three";
import vertexShader from "../sphereCamera/shaders/vertex.glsl";


/**
 * @class
 *
 * @classdesc
 * Stereographic camera.
 * Used for VR.
 * The position of the camera corresponds to the midpoint between the two eyes.
 */
export class VRCamera extends SphereCamera {

    /**
     * Constructor.
     * @param {Object} parameters - the parameters of the camera.
     * Additional parameters are
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

    setThreeScene(shaderBuilders) {
        const geometry = new SphereGeometry(50, 60, 40);
        // sphere eversion !
        geometry.scale(1, 1, -1);

        const leftMaterial = new ShaderMaterial({
            uniforms: shaderBuilders[LEFT].uniforms,
            vertexShader: vertexShader,
            fragmentShader: shaderBuilders[LEFT].fragmentShader
        });
        const rightMaterial = new ShaderMaterial({
            uniforms: shaderBuilders[RIGHT].uniforms,
            vertexShader: vertexShader,
            fragmentShader: shaderBuilders[LEFT].fragmentShader
        });
        const leftHorizonSphere = new Mesh(geometry, leftMaterial);
        const rightHorizonSphere = new Mesh(geometry, rightMaterial);
        leftHorizonSphere.layers.set(1);
        rightHorizonSphere.layers.set(2);
        this.threeScene.add(leftHorizonSphere, rightHorizonSphere);
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
}