import {
    EventDispatcher,
    Matrix4,
    Vector3
} from "./lib/three.module.js";

import {
    Vector,
} from "./geometry/abstract/Vector.js";

import {
    bind
} from "./utils.js";

const EPS = 0.000001;


/**
 * Compute a rotation matrix sending the source to the target
 * @param {Vector3} source
 * @param {Vector3} target
 */
Matrix4.prototype.makeRotationFromVectors = function (source, target) {
    const axis = new Vector3().crossVectors(source, target)
    if (axis.lengthSq() < EPS) {
        this.identity();
    } else {
        axis.normalize();
        const angle = Math.acos(source.dot(target));
        this.makeRotationAxis(axis, angle);
    }
    return this;
}


/**
 * @class
 *
 * @classdesc
 * Implements controls to fly in the geometry using the VR controllers.
 * - The squeeze button is used to drag (and rotate) the scene.
 * - The select button is used to move in the direction of the controller
 * This is inspired from Three.js
 * {@link https://threejs.org/docs/#examples/en/controls/FlyControls | FlyControls}
 */
class VRControls extends EventDispatcher {

    /**
     * Constructor
     * @param {RelPosition} position - the position in the geometry of the observer
     * @param {Group} controller - the group representing the controller
     */
    constructor(position, controller) {
        super();
        this.position = position;
        this.controller = controller;

        this.movementSpeed = 0.5;

        this._isSelecting = false;
        this._isSqueezing = false;

        const _onSelectStart = bind(this, this.onSelectStart);
        const _onSelectEnd = bind(this, this.onSelectEnd);
        const _onSqueezeStart = bind(this, this.onSqueezeStart);
        const _onSqueezeEnd = bind(this, this.onSqueezeEnd);


        this.controller.addEventListener('selectstart', _onSelectStart);
        this.controller.addEventListener('selectend', _onSelectEnd);
        this.controller.addEventListener('squeezestart', _onSqueezeStart);
        this.controller.addEventListener('squeezeend', _onSqueezeEnd);
    }

    /**
     * Event handler when the user starts selecting
     */
    onSelectStart() {
        this._isSelecting = true;
    }

    /**
     * Event handler when the user stops selecting
     */
    onSelectEnd() {
        this._isSelecting = false;
    }

    /**
     * Event handler when the user starts squeezing
     */
    onSqueezeStart() {
        this._isSqueezing = true;
    }

    /**
     * Event handler when the user stops squeezing
     */
    onSqueezeEnd() {
        this._isSqueezing = false;
    }

    /**
     * Function to update the position
     * @todo Dispatch an event, when the position has sufficiently changed.
     *
     * @type {Function}
     */
    get update() {
        if (this._update === undefined) {
            const oldDirection = new Vector();

            this._update = function (delta) {
                // call the new direction of the controller
                const newDirection = new Vector();
                this.controller.getWorldDirection(newDirection);
                newDirection.normalize();

                if (this._isSelecting) {
                    // flow if the select button is pressed
                    const deltaPosition = newDirection
                        .clone()
                        .multiplyScalar(-this.movementSpeed * delta)
                    this.position.flow(deltaPosition);
                }
                if (this._isSqueezing) {
                    // rotate if the squeeze button is pressed
                    const m = new Matrix4().makeRotationFromVectors(newDirection, oldDirection);
                    this.position.applyFacing(m);
                }

                // record the direction for the next call of this.udpate
                oldDirection.copy(newDirection);
            }
        }
        return this._update;


    }


}

export {
    VRControls
}
