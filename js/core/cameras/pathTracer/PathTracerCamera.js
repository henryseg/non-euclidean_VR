import {BasicCamera} from "../basic/BasicCamera.js";

import struct from "./shaders/struct.js";
import mapping from "./shaders/mapping.js";

export class PathTracerCamera extends BasicCamera {

    /**
     *
     * @param parameters
     */
    constructor(parameters) {
        super(parameters);
        /**
         * Focal length
         * @type {number}
         */
        this.focalLength = parameters.focalLength !== undefined ? parameters.focalLength : 1;
        /**
         * Aperture
         * @type {number}
         */
        this.aperture = parameters.aperture !== undefined ? parameters.aperture : 0;
    }

    /**
     * build the GLSL code needed to declare the camera
     * @param {ShaderBuilder} shaderBuilder - the shader builder
     */
    shader(shaderBuilder) {
        shaderBuilder.addClass('Camera', struct);
        shaderBuilder.addUniform('camera', 'Camera', this);
        shaderBuilder.addChunk(mapping);
    }
}