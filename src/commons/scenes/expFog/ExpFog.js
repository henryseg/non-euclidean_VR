import {Color} from "three";

import {Fog} from "../../../core/scene/Fog.js";

import struct from "./shaders/struct.glsl";
import fog from "./shaders/apply.glsl";

/**
 * @class
 * @extends Fog
 *
 * @classdesc
 * Exponential fog
 */
export class ExpFog extends Fog {

    /**
     * Constructor.
     * @param {Color} color - the fog color
     * @param {number} scattering - parameter controlling the scattering rate
     */
    constructor(color, scattering) {
        super();
        /**
         * Fog color
         * @type {Color}
         */
        this.color = color;
        /**
         * Parameter controlling the scattering rate
         * @type {number}
         */
        this.scattering = scattering
    }

    /**
     * Extend the given shader with the appropriate code
     * @param {ShaderBuilder}  shaderBuilder - the shader builder
     */
    shader(shaderBuilder) {
        shaderBuilder.addClass('ExpFog', struct);
        shaderBuilder.addUniform('fog', 'ExpFog', this);
        shaderBuilder.addChunk(fog);
    }
}