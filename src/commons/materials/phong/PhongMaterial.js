import {Color} from 'three';

import {Material} from "../../../core/materials/Material.js";

import struct from "./shaders/struct.glsl";
import render from "./shaders/render.glsl.mustache";


/**
 * @class
 *
 * @classdesc
 * Material for objects in the scene
 *
 * @see Further information on the {@link https://en.wikipedia.org/wiki/Phong_reflection_model|Phong lighting model}
 */
export class PhongMaterial extends Material {
    /**
     * Constructor. Build a new material from the given data
     * @param {Object} params - the parameters of the material:
     * - {Color} color - the color of the material
     * - {number} ambient - the ambient reflection constant
     * - {number} diffuse - the diffuse reflection constant
     * - {number} specular - the specular reflection constant
     * - {number} shininess - the shininess reflection constant
     * - {Light[]} lights - light affecting the material
     */
    constructor(params = {}) {
        super();
        /**
         * Color of the material
         * @type {Color}
         */
        this.color = params.color !== undefined ? params.color : new Color(1, 1, 1);
        /**
         * ambient reflection constant
         * @type {number}
         */
        this.ambient = params.ambient !== undefined ? params.ambient : 0.5;
        /**
         * diffuse reflection constant
         * @type {number}
         */
        this.diffuse = params.diffuse !== undefined ? params.diffuse : 0.4;
        /**
         * specular reflection constant
         * @type {number}
         */
        this.specular = params.specular !== undefined ? params.specular : 0.1;

        // make sure that the three coefficient add up to one.
        const sum = this.ambient + this.diffuse + this.specular;
        this.ambient = this.ambient / sum;
        this.diffuse = this.diffuse / sum;
        this.specular = this.specular / sum;
        /**
         * shininess reflection constant
         * @type {number}
         */
        this.shininess = params.shininess !== undefined ? params.shininess : 10;
        /**
         * Is the material reflecting (false by default)
         * The changes will no be passed to the shader (hard coded shader)
         * @type {boolean}
         */
        this._isReflecting = params.isReflecting !== undefined ? params.isReflecting : false;
        /**
         * Reflectivity of the material
         * @type {Color}
         */
        this.reflectivity = params.reflectivity !== undefined ? params.reflectivity : new Color(0, 0, 0);
        /**
         * lights affecting the material
         * @type {Light[]}
         */
        this.lights = params.lights;
    }

    get uniformType() {
        return 'PhongMaterial';
    }

    get usesLight() {
        return true;
    }

    get isReflecting() {
        return this._isReflecting;
    }

    static glslClass() {
        return struct;
    }

    glslRender() {
        return render(this);
    }

    shader(shaderBuilder) {
        for (const light of this.lights) {
            light.shader(shaderBuilder);
        }
        super.shader(shaderBuilder);
    }
}