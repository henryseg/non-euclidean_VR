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
     * @param {number} maxDirs - the maximum number of directions computed for this light.
      */
    constructor(maxDirs) {
        super();
        /**
         * Maximum number of directions computed for this light.
         * @type {number}
         */
        this.maxDirs = maxDirs
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
     * The GLSL direction function should have the following signature
     * `bool {{name}}_directions(ExtVector v, int i, out ExtVector dir, out float intensity)`
     * where
     * - `v` gives the position at which we compute the direction
     * - `i` means that we are computed the i-th direction (the index start at i = 0)
     * The function returns true if the i-th direction exists and false otherwise.
     * If the i-th direction exists, then it populates dir with the direction
     * and intensity with the light intensity (in this direction).
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