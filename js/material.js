import {
    Color
} from './lib/three.module.js';

/**
 * Add a method to Three.js Color.
 * Return a block of GLSL code recreating the same color as a vec3
 * @return {string}
 */
Color.prototype.toGLSL = function () {
    return `vec3(${this.toArray()})`;
}


/**
 * @class
 *
 * @classdesc
 * Material for objects in the scene
 *
 * @see Further information on the {@link https://en.wikipedia.org/wiki/Phong_reflection_model|Phong lighting model}
 *
 * @todo Decide what to do for texture, color given by formulas, etc.
 * @todo Actually, could we just reuse Three.js Material class? (or another existing class)
 * The name of the class is in conflict the the Three.js one.
 * Do we want to fix this ? Maybe note, modules have tools to handle this situation.
 */
class Material {
    /**
     * Constructor. Build a new material from the given data
     * @param {Object} data - the properties of the material
     */
    constructor(data = {}) {
        this.color = data.color;
        this.ambient = data.ambient;
        this.diffuse = data.diffuse;
        this.specular = data.specular;
        this.shininess = data.shininess;
    }

    /**
     * Color of the material
     * @type {Color}
     */
    get color() {
        return this._color;
    }

    set color(value) {
        if (value === undefined) {
            this._color = new Color(1, 1, 1);
        } else {
            this._color = value;
        }
    }

    /**
     * ambient reflection constant
     * @type {number}
     */
    get ambient() {
        return this._ambient;
    }

    set ambient(value) {
        if (value === undefined) {
            this._ambient = 0.5;
        } else {
            this._ambient = value;
        }
    }

    /**
     * diffuse reflection constant
     * @type {number}
     */
    get diffuse() {
        return this._diffuse;
    }

    set diffuse(value) {
        if (value === undefined) {
            this._diffuse = 0.5;
        } else {
            this._diffuse = value;
        }
    }

    /**
     * specular reflection constant
     * @type {number}
     */
    get specular() {
        return this._specular;
    }

    set specular(value) {
        if (value === undefined) {
            this._specular = 0.5;
        } else {
            this._specular = value;
        }
    }

    /**
     * shininess reflection constant
     * @type {number}
     */
    get shininess() {
        return this._shininess;
    }

    set shininess(value) {
        if (value === undefined) {
            this._shininess = 10;
        } else {
            this._shininess = value;
        }
    }

    /**
     * Return a line of GLSL code creating the same material
     * Used when dynamically building shaders.
     * @return {string}
     */
    toGLSL() {
        return `Material(
            ${this.color.toGLSL()}, 
            ${this.ambient.toGLSL()}, 
            ${this.diffuse.toGLSL()}, 
            ${this.specular.toGLSL()}, 
            ${this.shininess.toGLSL()}
            )`;
    }
}

export {
    Material
}
