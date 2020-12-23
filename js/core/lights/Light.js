import {Generic} from "../Generic.js";

/**
 * @class
 * @abstract
 *
 * @classdesc
 * Abstract class for lights
 */
export class Light extends Generic {

    /**
     * Constructor.
     * The constructor takes no argument.
     */
    constructor() {
        super();
    }

    /**
     * Says that the object inherits from `Light`
     * @type {boolean}
     */
    get isLight() {
        return true;
    }

    /**
     * Return the chunk of GLSL code corresponding to the direction field.
     * @abstract
     * @return {string}
     */
    glslDirections() {
        throw new Error('Light: this method should be implemented');
    }

    /**
     * Compile all the function directly related to the object (e.g. direction field).
     * @return {string}
     */
    glslInstance() {
        return this.glslDirections();
    }
}