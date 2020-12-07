import {
    EventDispatcher,
    Matrix4,
} from "./lib/three.module.js";

import {
    RelPosition,
    Vector
} from "./geometry/abstract.js";

import {
    bind
} from "./utils.js";

/**
 * @desc
 * Keyboard bindings.
 * Each main entry correspond to a keyboard type (American, French, etc).
 * KeyCode are replaced by Key (as KeyCode are now deprecated).
 * To each key is associated an action
 * @const
 */
const KEYBOARD_BINDINGS = {
    'us': {
        "a": "yawLeft",
        "d": "yawRight",
        "w": "pitchUp",
        "s": "pitchDown",
        "q": "rollLeft",
        "e": "rollRight",
        "ArrowUp": "forward",
        "ArrowDown": "back",
        "ArrowLeft": "left",
        "ArrowRight": "right",
        "'": "up",
        "/": "down",
        "i": "info",
    },
    'fr': {
        "q": "yawLeft",
        "d": "yawRight",
        "z": "pitchUp",
        "s": "pitchDown",
        "a": "rollLeft",
        "e": "rollRight",
        "ArrowUp": 'forward',
        "ArrowDown": "back",
        "ArrowLeft": "left",
        "ArrowRight": "right",
        "ù": "up",
        "=": "down",
        "i": "info",
    }
};


// internals constants

const CHANGE_EVENT = {type: "change"};
const EPS = 0.000001;


/**
 * @class
 *
 * @classdesc
 * Implements controls to fly in the geometry using the keyboard.
 * This is inspired from Three.js
 * {@link https://threejs.org/docs/#examples/en/controls/FlyControls | FlyControls}
 */
class KeyboardControls extends EventDispatcher {


    /**
     * Constructor
     * @param {RelPosition} position - the position in the geometry of the observer.
     * (and not the one of the three.js camera in the virtual euclidean space).
     * @param {Camera} camera - the Three.js camera
     * (needed to get the orientation of the observer when using both VR and keyboard).
     * @param {HTMLElement} domElement - The HTML element used for event listeners.
     * @param {string} keyboard - the keyboard type (us, fr, etc)
     */
    constructor(position, camera, domElement, keyboard) {
        super();
        this.position = position;
        this.camera = camera;
        this.domElement = domElement;
        if (domElement) this.domElement.setAttribute('tabindex', "- 1");

        this.keyboard = keyboard;

        this.movementSpeed = 0.5;
        this.rollSpeed = 0.8;

        this.infos = undefined;

        // private fields
        this._moveState = {
            up: 0,
            down: 0,
            left: 0,
            right: 0,
            forward: 0,
            back: 0,
            pitchUp: 0,
            pitchDown: 0,
            yawLeft: 0,
            yawRight: 0,
            rollLeft: 0,
            rollRight: 0
        };
        this._moveVector = new Vector(0, 0, 0);
        this._rotationVector = new Vector(0, 0, 0);

        const _keydown = bind(this, this.onKeyDown);
        const _keyup = bind(this, this.onKeyUp);

        window.addEventListener('keydown', _keydown, false);
        window.addEventListener('keyup', _keyup, false);
    }

    /**
     * The keyboard used for the controls
     * @type {string}
     */
    get keyboard() {
        return this._keyboard;
    }

    set keyboard(value) {
        if (value === undefined) {
            this._keyboard = 'us';
        } else {
            this._keyboard = value;
        }
    }

    /**
     * Function called when pressing the info key
     * @type {Function}
     */
    get infos() {
        return this._infos;
    }

    set infos(value) {
        if (value === undefined) {
            this._infos = function () {
                console.log("Information function has not been set up");
            }
        } else {
            this._infos = value;
        }
    }


    /**
     * Event handler when a key is pressed
     * @param {KeyboardEvent} event - the caught event
     */
    onKeyDown(event) {
        if (event.key in KEYBOARD_BINDINGS[this.keyboard]) {
            const action = KEYBOARD_BINDINGS[this.keyboard][event.key]
            switch (action) {
                case "info":
                    this.infos();
                    break;
                default:
                    this._moveState[action] = 1;
            }
        }
    }


    /**
     * Event handler when a key is pressed
     * @param {KeyboardEvent} event - the caught event
     */
    onKeyUp(event) {
        if (event.key in KEYBOARD_BINDINGS[this.keyboard]) {
            const action = KEYBOARD_BINDINGS[this.keyboard][event.key]
            switch (action) {
                case "info":
                    break;
                default:
                    this._moveState[action] = 0;
            }
        }
    }


    /**
     * Update the movement vector
     */
    updateMovementVector() {
        this._moveVector.x = (-this._moveState.left + this._moveState.right);
        this._moveVector.y = (-this._moveState.down + this._moveState.up);
        this._moveVector.z = (-this._moveState.forward + this._moveState.back);

        // console.log( 'move:', [ this._moveVector.x, this._moveVector.y, this._moveVector.z ] );

    };

    /**
     * Update the rotation vector
     */
    updateRotationVector() {
        this._rotationVector.x = (-this._moveState.pitchDown + this._moveState.pitchUp);
        this._rotationVector.y = (-this._moveState.yawRight + this._moveState.yawLeft);
        this._rotationVector.z = (-this._moveState.rollRight + this._moveState.rollLeft);

        //console.log( 'rotate:', [ this._rotationVector.x, this._rotationVector.y, this._rotationVector.z ] );

    };

    /**
     * Function to update the position
     *
     * Assume that the current position is `(g,m)` where
     * - `g` is the boost, i.e. subgroup element * local boost
     * - `m` is the facing, i.e. an element of O(3)
     *
     * Denote by `a` the Matrix4 representing the Three.js camera orientation, understood as an element of O(3) as well.
     * Denote by `e = (e1, e2, e3)` the reference frame in the tangent space at the origin.
     * Then the frame at `p = go` attach to the camera is `f = d_og . m . a . e`
     * That is the camera is looking at the direction `-f3 = - d_og . m . a . e3`
     *
     * Assume now that we want to move in the direction of `v = (v1,v2,v3)` where the vector is given in the frame `f`,
     * i.e. `v = v1. f1 + v2 . f2 + v3. f3`.
     * We need to flow the current position in the direction `w`,
     * where `w` corresponds to `v` written in the "position frame", i.e. `d_og . m . e`.
     * In other words `w = a . u`, where `u = v1 . e1 + v2 . e2 + v3 . e3`.
     * Note that we do not change the camera orientation.
     *
     * A similar strategy works for the rotations.
     * @todo Dispatch an event, when the position has sufficiently changed.
     *
     * @param {number} delta - time delta between two updates
     */
    update(delta) {
        this.updateMovementVector();
        const deltaPosition = this._moveVector
            .clone()
            .multiplyScalar(this.movementSpeed * delta)
            .applyMatrix4(this.camera.matrixWorld);
        this.position.flow(deltaPosition);

        this.updateRotationVector();
        const axis = this._rotationVector
            .clone()
            .applyMatrix4(this.camera.matrixWorld)
            .normalize();
        const angle = 0.5 * this.rollSpeed * delta;
        const m = new Matrix4().makeRotationAxis(axis, angle);
        this.position.applyFacing(m);

        // if (false) {
        //     this.dispatchEvent(CHANGE_EVENT);
        // }
    }

}

export {
    KeyboardControls
}
