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
        /**
         * The light eventually affecting the material.
         * If `lights` is not set up when the solid carrying the material is added to the scene,
         * then `lights` is set up to the list of lights in the scene.
         * @type{Light[]}
         */
        this.lights = undefined;
        /**
         * Reflectivity of the material.
         * Each channel (red, blue, green), interpreted as number between 0 and 1,
         * is the reflectivity coefficient of the corresponding color
         * (0 = no reflectivity, 1 = all light is reflected).
         * @type {Color}
         */
        this.reflectivity = undefined;
    }

    /**
     * Says that the object inherits from `Material`
     * @type {boolean}
     */
    get isMaterial() {
        return true;
    }

    /**
     * Says whether the material requires the normal to the shape for its computation.
     * Default is true.
     * @return {boolean}
     */
    get usesNormal() {
        return true;
    }

    /**
     * Says whether the material requires a UV map on the shape for its computation.
     * Default is false.
     * @return {boolean}
     */
    get usesUVMap() {
        return false;
    }

    /**
     * Says whether the material reacts to (certain) lights in the scene.
     * Default is false.
     * @return {boolean}
     */
    get usesLight() {
        return false;
    }

    /**
     * Says whether the material is reflecting
     * Default is false.
     * @return {boolean}
     */
    get isReflecting() {
        return false;
    }

    onAdd(scene) {
        if (this.usesLight) {
            if (!this.hasOwnProperty('lights') || this['lights'] === undefined) {
                this.lights = scene.lights;
            }
        }
    }

    /**
     * Return the chunk of GLSL code used to compute the color of the material at the given point
     * The render function on the GLSL side should have one of the signatures
     * - `vec3 {{name}}_render(RelVector v)`
     * - `vec3 {{name}}_render(RelVector v, RelVector normal)`
     * - `vec3 {{name}}_render(RelVector v, vec2 uv)`
     * - `vec3 {{name}}_render(RelVector v, RelVector normal, vec2 uv)`
     * The exact signature depends whether the material requires a normal or UV coordinates.
     * Here v is the vector obtained when we hit the shape.
     * It should return the color as a vec3 of the material at the given point, without taking into account reflections.
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
