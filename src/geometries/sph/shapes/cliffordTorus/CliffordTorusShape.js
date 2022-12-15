import {Isometry, Point} from "../../geometry/General.js";
import {BasicShape} from "../../../../core/shapes/BasicShape.js";

import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";
import gradient from "../../../../core/shapes/shaders/gradient.glsl.mustache";
import uv from "../../../../core/shapes/shaders/uv.glsl.mustache";

/**
 * @class
 *
 * @classdesc
 * Shape of the Clifford torus in the three-sphere…
 * which is also a cylinder of radius pi/2 around a geodesic!
 */
export class CliffordTorusShape extends BasicShape {

    /**
     * Construction
     * @param {Isometry} location - data for the center of the torus (not implemented yet)
     */
    constructor(location) {
        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else {
            throw new Error('CliffordTorusShape: this type of location is not allowed');
        }
        super(isom);
    }

    updateData() {
        super.updateData();
    }

    /**
     * Says that the object inherits from `Clifford torus`
     * @type {boolean}
     */
    get isCliffordTorusShape() {
        return true;
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    get hasUVMap() {
        return true;
    }

    get uniformType() {
        return 'CliffordTorusShape';
    }

    static glslClass() {
        return struct;
    }

    glslSDF() {
        return sdf(this);
    }

    glslGradient() {
        return gradient(this);
    }

    glslUVMap() {
        return uv(this);
    }

}