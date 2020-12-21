import {
    EventDispatcher,
    Quaternion,
} from "../lib/three.module.js";

import {
    Vector,
} from "../core/abstract/Vector.js";

import {
    bind
} from "../utils.js";


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
class VRControlsDrag extends EventDispatcher {

    /**
     * Constructor
     * @param {RelPosition} position - the position in the geometry of the observer
     * @param {Group} controller - the group representing the controller
     */
    constructor(position, controller) {
        super();
        this.position = position;
        this.controller = controller;

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
            const n = 10;
            const avgDirection0 = new Vector();
            const avgDirection1 = new Vector();
            let directions = [];
            let i = 0;
            let start = false;

            this._update = function (delta) {
                // call the new direction of the controller

                  const newDirection = new Vector();
                  this.controller.getWorldDirection(newDirection);
                  newDirection.normalize().multiplyScalar(1 / n);

                  avgDirection1.add(newDirection);
                  if (start) {
                      avgDirection1.sub(directions[i]);
                  }
                  directions[i] = newDirection;

                  if (start && this._isSelecting) {
                      const target = avgDirection1.clone().normalize();
                      const source = avgDirection0.clone().normalize();
                      const quaternion = new Quaternion().setFromUnitVectors(target, source).normalize();
                      this.position.applyQuaternion(quaternion);
                  }

                  avgDirection0.copy(avgDirection1);
                  i = (i + 1) % n;
                  if(i === 0){
                      start = true;
                  }

            }
        }
        return this._update;


    }


}

export {
    VRControlsDrag
}
