import {VRCamera} from "../../../../core/General.js";
import {LEFT, RIGHT} from "../../../../constants.js";

import struct from "./shaders/struct.glsl";
import mapping from "./shaders/mapping.glsl";

/**
 * @class
 *
 * @classdesc
 * Native VR view in hyperbolic space.
 * The mapping of the horizon is made in such a way that
 * two rays which are parallel for a euclidean observer, converges to the same point at infinity in H3.
 */
export class NativeCamera extends VRCamera {

    constructor(parameters) {
        super(parameters);
        this.fakeCameras[LEFT].ipDist = -this.ipDist;
        this.fakeCameras[RIGHT].ipDist = this.ipDist;
    }


    /**
     * build the GLSL code needed to declare the camera
     * @param {ShaderBuilder} shaderBuilder - the shader builder
     * @param {number} side - the side (left of right) (used for stereographic camera)
     */
    sidedShader(shaderBuilder, side) {
        shaderBuilder.addClass('NativeCamera', struct);
        shaderBuilder.addUniform('camera', 'NativeCamera', this.fakeCameras[side]);
        shaderBuilder.addChunk(mapping);
    }
}