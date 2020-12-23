import {Vector} from "./Vector.js";
import stereo from "./shaders/stereo.js";

/**
 * Class to add eventually some "distortion" to the stereo
 * Typically used in H3 (tourist vs native view)
 */

class Stereo {
    /**
     * Constructor
     * @param {number} ipDist - **half** the interpupillary distance
     */
    constructor(ipDist = undefined) {

        /**
         * True if stereo is on
         * @type {boolean}
         */
        this.on = false;
        this.ipDist = ipDist;
    }

    /**
     * True if stereo is off
     * @type {boolean}
     */
    get off() {
        return !this.on
    }

    /**
     * Turn the stereo mode on or off
     */
    switch() {
        this.on = !this.on;
    }


    /**
     * **Half** the interpupillary distance
     * @return {number}
     */
    get ipDist() {
        return this._ipDist;
    }

    set ipDist(value) {
        if (value === undefined) {
            this._ipDist = 0.03200000151991844;
        } else {
            this._ipDist = value;
        }
    }

    /**
     * Return the two positions corresponding to the left and right eye.
     * The method just offset the eyes using parallel transport.
     * @param {Matrix4} cameraMatrix - a matrix representing the orientation of the camera.
     * Hence if `(g,m)` is the current position and `e` the reference frame at then origin,
     * then the frame of the user is `d_og . m . cameraMatrix . e`
     * @param {RelPosition} position - the position of the observer
     * @return {RelPosition[]} - the position of the left and right eye
     */
    eyes(cameraMatrix, position) {
        // start from the position of the observer.
        const rightEye = position.clone();
        const leftEye = position.clone();

        if(this.on) {
            // if we are in VR mode we offset the position of the left and right eyes
            // to that end, we flow the position along the left / right direction
            // we have to be careful that left and right are meant in the point of view of the camera.
            const rightDir = new Vector(1, 0, 0)
                .multiplyScalar(this.ipDist)
                .applyMatrix4(cameraMatrix);
            const leftDir = rightDir.clone().negate();
            rightEye.flow(rightDir);
            leftEye.flow(leftDir);
        }

        // return the positions of the eyes
        return [leftEye, rightEye];
    }

}

export {Stereo};