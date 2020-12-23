/**
 * Class to add eventually some "distortion" to the stereo between left and right eye.
 * Take a point on the horizon sphere, and return the direction of the light ray we should follow.
 * @abstract
 */

export class Stereo {
    /**
     * Constructor
     */
    constructor() {

    }

    /**
     * Build needed shader
     * @abstract
     * @param shaderBuilder
     */
    shader(shaderBuilder) {
        throw new Error('Stereo: this method should be implemented')
    }
}