import {Color} from "../../../lib/threejs/build/three.module.js";
import {Fog} from "../../../core/scene/Fog.js";

import struct from "./shaders/struct.js";
import fog from "./shaders/apply.js";

/**
 * @class
 * @extends Fog
 *
 * @classdesc
 * Linear fog
 */
export class LinFog extends Fog {

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
        shaderBuilder.addClass('LinFog', struct);
        shaderBuilder.addUniform('fog', 'LinFog', this);
        shaderBuilder.addChunk(fog);
    }
}