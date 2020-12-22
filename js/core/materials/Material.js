import {Generic} from "../Generic.js";

/**
 * @class
 * @abstract
 *
 * @classdesc
 * Abstract class for materials
 */
export class Material extends Generic {

    /**
     * Constructor.
     */
    constructor() {
        super();
    }

    /**
     * Says that the object inherits from `Material`
     * @type {boolean}
     */
    get isMaterial() {
        return true;
    }

    /**
     * Says whether the shape is global.
     * This property does not make sense for material.
     * @type {boolean}
     */
    get isGlobal() {
        throw new Error('Material: isGlobal has no meaning for materials');
    }

    /**
     * Says whether the shape is local. True if local, false otherwise
     * @type {boolean}
     */
    get isLocal() {
        return !this.isGlobal;
    }

    /**
     * Return the chunk of GLSL code used to compute the color of the material at the given point
     * @abstract
     * @return {string}
     */
    glslRender() {
        throw new Error('Material: this method should be implemented');
    }

    /**
     * Compile all the function directly related to the object (e.g. render).
     * @return {string}
     */
    glslInstance() {
        return this.glslRender();
    }
}
