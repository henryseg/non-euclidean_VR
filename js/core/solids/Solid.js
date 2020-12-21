import {Generic} from "../Generic.js";

/**
 * @class
 * @abstract
 *
 * @classdesc
 * Abstract class for solids.
 * Unlike shapes, materials or lights, solids have no existence as a structure on the shader side.
 * This comes from the fact that the type of shape / material may vary.
 * As a consequence, solids do not have a numerical ID, just a UUID.
 */
export class Solid extends Generic {

    /**
     *
     * @param {Shape} shape - the shape of the solid
     * @param {Material} material - the material of the solid
     */
    constructor(shape, material) {
        super();
        /**
         * The shape of the solids
         * @type {Shape}
         */
        this.shape = shape;
        /**
         * The material of the solid
         * @type {Material}
         */
        this.material = material;
    }

    /**
     * Say if the item is a solid
     * @type {boolean}
     */
    get isSolid() {
        return true;
    }

    get isGlobal() {
        return this.shape.isGlobal;
    }

    /**
     * Set the ID of the shape and material
     * @param {number} id - the first available ID
     * @return {number} the next available id after all IDs have been assigned
     */
    setId(id) {
        let res = id;
        res = this.shape.setId(res);
        res = this.material.setId(res);
        res = super.setId(res);
        return res;
    }

    static glslStruct() {
        return '';
    }

    /**
     * Compile all the function directly related to the object (e.g. sdf, gradient, direction field, etc).
     * @return {string}
     */
    glslLogic() {
        return '';
    }

    shader(shaderBuilder) {
        this.shape.shader(shaderBuilder);
        this.material.shader(shaderBuilder);
        super.shader(shaderBuilder);
    }
}