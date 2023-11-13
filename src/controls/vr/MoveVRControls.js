import {
    EventDispatcher,
} from "three";

import {
    Vector,
} from "../../core/geometry/Vector.js";

import {
    bind
} from "../../core/utils.js";

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
export class MoveVRControls extends EventDispatcher {

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
     */
    update(delta) {
        // call the new direction of the controller
        if (this._isSelecting) {
            // flow if the select button is pressed
            const deltaPosition = new Vector();
            this.controller.getWorldDirection(deltaPosition);
            deltaPosition
                .normalize()
                .multiplyScalar(-this.movementSpeed * delta)
            this.position.flow(deltaPosition);
        }
    }
}
