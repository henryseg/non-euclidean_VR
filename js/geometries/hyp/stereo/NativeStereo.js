import {Stereo} from "../../../core/geometry/Stereo.js";

/**
 *
 * @class
 * @classdesc
 * Native view in hyperbolic three-space.
 * The terminology comes from Jeff Weeks.
 */
class NativeStereo extends Stereo {

    constructor(ipDist = undefined) {
        super(ipDist);
    }

    get shaderSource() {
        return "/shaders/geometry/hyp/stereo/native.glsl";
    }
}

export {NativeStereo}