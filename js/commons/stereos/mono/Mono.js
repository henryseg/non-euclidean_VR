import {Stereo} from "../../../core/geometry/Stereo.js";
import mono from "./shaders/mono.js";

/**
 * Class to add eventually some "distortion" to the stereo
 * Typically used in H3 (tourist vs native view)
 */

export class Mono extends Stereo {
    /**
     * Constructor.
     */
    constructor() {
        super();
    }

    /**
     * Build needed shader
     * @param shaderBuilder
     */
    shader(shaderBuilder) {
        shaderBuilder.addChunk(mono);
    }
}