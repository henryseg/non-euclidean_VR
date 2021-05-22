import {Color} from '../../../lib/threejs/build/three.module.js';
import {Material} from "../../../core/materials/Material.js";

import struct from "./shaders/struct.js";
import render from "./shaders/render.js";
import {mustache} from "../../../lib/mustache.mjs";

/**
 * @class
 *
 * @classdesc
 * Material for objects in the scene
 *
 * @see Further information on the {@link https://en.wikipedia.org/wiki/Phong_reflection_model|Phong lighting model}
 */
export class DebugMaterial extends Material {
    /**
     * Constructor. Build a new material from the given data
     * @param {Light} light - the light whose parameters are used in the material.
     * @param {Object} params - the parameters of the material:
     */
    constructor(light, params = {}) {
        super();
        /**
         * lights affecting the material
         * @type {Light[]}
         */
        this.lights = [light];
    }

    get uniformType() {
        return '';
    }

    get usesLight() {
        return true;
    }

    get isReflecting() {
        return false;
    }

    static glslClass() {
        return struct;
    }

    glslRender() {
        return mustache.render(render, this);
    }

    shader(shaderBuilder) {
        for (const light of this.lights) {
            light.shader(shaderBuilder);
        }
        super.shader(shaderBuilder);
    }
}