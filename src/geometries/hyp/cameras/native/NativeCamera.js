import {VRCamera} from "../../../../core/cameras/vrCamera/VRCamera.js";
import {LEFT, RIGHT} from "../../../../core/constants.js";

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
        for (const side in [LEFT, RIGHT]) {
            this.fakeCameras[side].matrixInverse = this.threeCamera.matrixWorldInverse;
        }
    }

    static glslClass() {
        return struct;
    }

    static glslMapping() {
        return mapping;
    }
}