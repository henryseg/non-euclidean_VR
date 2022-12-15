import {BasicCamera} from "../../../../core/cameras/basic/BasicCamera";

import struct from "./shaders/struct.glsl";
import mapping from "./shaders/mapping.glsl";

/**
 * @class
 *
 * @classdesc
 * Euclidean camera to perform a dolly zoom effect.
 * The setup is the following.
 * the object respectively called focus, center, radius and ratio in the constructor
 * A screen is placed at the position p of the camera, orthogonal to the direction the camera is looking at.
 * In the local frame of the camera we define
 * - f = (0, 0, focus, 1)
 * - q = (0, R, center, 1)
 * The line (fq) intersect the screen at a point (x,y) so that |y| = r h / 2, where h is the height of the screen.
 * The dolly effect will be obtained letting f tends to infinity.
 */
export class DollyCamera extends BasicCamera {

    /**
     * Constructor.
     * @param {Object} parameters - the parameters of the camera.
     * Additional parameters are
     * - {number} focus
     * - {number} center
     * - {number} radius
     * - {number} ratio
     */
    constructor(parameters) {
        super(parameters);
        this.focus = parameters.focus;
        this.center = parameters.center;
        this.screen = parameters.screen;
        this.radius = parameters.radius;
        this.ratio = parameters.ratio;
    }

    /**
     * build the GLSL code needed to declare the camera
     * @param {ShaderBuilder} shaderBuilder - the shader builder
     */
    shader(shaderBuilder) {
        shaderBuilder.addClass('DollyCamera', struct);
        shaderBuilder.addUniform('camera', 'DollyCamera', this);
        shaderBuilder.addChunk(mapping);
    }


}