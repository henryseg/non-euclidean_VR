import {
    bind
} from "../../utils.js";


/**
 * @class
 *
 * @classdesc
 * When pressing the button, change the color of the background
 * The color turn back to normal, when the button is released
 * Log the event if a log function is provided
 * The background material is assumed to be a single color material.
 */

const STATUS_WAITING = 0;
const STATUS_CLAPING = 1;

export class ClapVRControls {

    /**
     * Constructor
     * @param {Group} controller - the group representing the controller
     * @param {Scene} scene - the scene (to access its background color)
     * @param {Color} color - clap color
     * @param {function} log - a callback for the log
     *
     */
    constructor( controller,  scene, color, log =undefined) {
        this.controller = controller;
        this._status = STATUS_WAITING;

        this._scene = scene
        this._originalBgColor = this._scene.background.color.clone();
        this._clapBgGolor = color;
        this._log = log;

        const _onSelectStart = bind(this, this.onSelectStart);
        const _onSelectEnd = bind(this, this.onSelectEnd);

        this.controller.addEventListener('selectstart', _onSelectStart);
        this.controller.addEventListener('selectend', _onSelectEnd);
    }

    /**
     * Event handler when the user starts selecting
     */
    onSelectStart() {
        this._status = STATUS_CLAPING;
        this._scene.background.color.copy(this._clapBgGolor);
        if(this._log !== undefined){
            this._log();
        }
    }

    /**
     * Event handler when the user stops selecting
     */
    onSelectEnd() {
        this._status = STATUS_WAITING;
        this._scene.background.color.copy(this._originalBgColor);
    }
}