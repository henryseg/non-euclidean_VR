import {Stereo} from "../Stereo.js";

/**
 *
 * @class
 * @classdesc
 * For development purpose: a stereo mode where the scene is fixed (even if the user turns the head)
 */
class FixedDirectionStereo extends Stereo {

    constructor(ipDist = undefined) {
        super(ipDist);
    }

    get shaderSource() {
        return "/shaders/geometry/abstract/stereo/fixedDirection.glsl";
    }
}

export {FixedDirectionStereo}