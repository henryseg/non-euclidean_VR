import {Generic} from "../Generic.js";

import struct from "./shaders/struct.js";

/**
 * @class
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
        if (material.usesUVMap && !shape.hasUVMap) {
            throw new Error('Solid: a material using UV coordinates cannot be applied to a shape without a UV map');
        }
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
        /**
         * Says whether the solid should be rendered or not.
         * The property can be used to define solids that will appear later in the scene
         * (because of some animation, game event, etc) without having to rebuild the shader.
         * Default is true.
         * @type{boolean}
         */
        this.isRendered = true;
        this.addImport(struct)
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

    get uniformType(){
        return 'Solid';
    }

    /**
     * Set the ID of the shape.
     * Propagate the process if needed.
     * @param {Scene} scene - the scene to which the object is added.
     */
    setId(scene) {
        this.shape.setId(scene);
        this.material.setId(scene);
        super.setId(scene);
    }

    /**
     * Additional actions to perform when the object is added to the scene.
     * By default, propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    onAdd(scene) {
        this.shape.onAdd(scene);
        this.material.onAdd(scene);
        super.onAdd(scene);
    }

    static glslClass() {
        return '';
        // return struct;
    }

    /**
     * Return a chunk of GLSL code used to compute the color of the solid.
     * This computation may involve normal and/or UV coordinates.
     * This is automatically determined from the properties of the material.
     * @return {string}
     */
    glslInstance() {
        return '';
    }

    shader(shaderBuilder) {
        this.shape.shader(shaderBuilder);
        this.material.shader(shaderBuilder);
        super.shader(shaderBuilder);
    }
}