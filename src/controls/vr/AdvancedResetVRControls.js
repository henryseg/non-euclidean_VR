import {
    bind
} from "../../core/utils.js";


/**
 * @class
 *
 * @classdesc
 * When pressing the button, reset the position of the user (in the scene) to the given position.
 * Does not change the cellBoost
 * It can be used, when a VR experiment need be started at a very precise position (cf hexagon.html in H3)
 */

const RESET_CALLED = 1;
const RESET_WAIT = 0;

export class AdvancedResetVRControls {

    /**
     * Constructor
     * @param {RelPosition} position - the position in the geometry of the observer
     * @param {Position} targetPosition - the position in the geometry of the observer
     * @param {Group} controller - the group representing the controller
     * @param {boolean} alignFacing - option for updating the facing
     *  - if False, the facing of the position is reset to its default value (quaternion = 1).
     *  - if True, the facing is set up to that the camera is directed toward the negative z axis.
     *    in this case the camera should be passed to the constructor as an argument
     * @param {boolean} snap - if alignFacing and snap are true,
     * align the orientation to the "closest" relation around the y-axis
     * @param {VRCamera} camera - the camera (giving the position of the observer)
     *
     */
    constructor(position, targetPosition, controller, alignFacing = false, snap = false, camera = undefined) {
        this.position = position;
        this.targetPosition = targetPosition;
        this.controller = controller;

        this._reset = RESET_WAIT;
        this._alignFacing = alignFacing;
        this._snap = snap;
        this._camera = camera;
        if (this._alignFacing && camera === undefined) {
            throw new Error("AdvancedResetVRControls.constructor, the camera is needed when the alignFacing option is on");
        }

        const _onSqueezeStart = bind(this, this.onSqueezeStart);
        const _onSqueeezeEnd = bind(this, this.onSqueezeEnd);

        this.controller.addEventListener('squeezestart', _onSqueezeStart);
        this.controller.addEventListener('squeezeend', _onSqueeezeEnd);
    }

    /**
     * Event handler when the user starts selecting
     */
    onSqueezeStart() {
        this._reset = RESET_CALLED;
    }

    /**
     * Event handler when the user stops selecting
     */
    onSqueezeEnd() {
    }

    /**
     * Function to update the position
     */
    update() {
        if (this._reset === RESET_CALLED) {
            this.position.reset();
            if (this._alignFacing) {
                const matrix = this._camera.threeCamera.matrixWorld;
                this.position.local.quaternion.setFromRotationMatrix(matrix);
                if (this._snap) {
                    this.position.local.quaternion.x = 0;
                    this.position.local.quaternion.z = 0;
                    this.position.local.quaternion.normalize();
                }
                this.position.local.quaternion.invert();
            }
            this._reset = RESET_WAIT;
            this.position.local.boost.copy(this.targetPosition.boost);
            this.position.local.quaternion.premultiply(this.targetPosition.quaternion);
        }
    }
}