import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Vector4} from "../../../../lib/three.module.js";

import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";
import gradient from "./shaders/gradient.js";
import {mustache} from "../../../../lib/mustache.mjs";

/**
 * @class
 *
 * @classdesc
 * Euclidean half space
 */
export class HalfSpaceShape extends BasicShape {

    /**
     * Constructor.
     * @param {Point} pos - a point on the boundary of the half space
     * @param {Vector4|Vector3} normal - the normal to the half space
     */
    constructor(pos, normal) {
        super();
        /**
         * Point on the boundary of the half space
         * @type {Point}
         */
        this.pos = pos;
        /**
         * Normal to the half space
         * @type {Vector4}
         */
        this.normal = new Vector4(normal.x, normal.y, normal.z, 0).normalize();
    }

    get isGlobal() {
        return true;
    }

    get isHalfSpaceShape() {
        return true;
    }

    get uniformType() {
        return 'HalfSpaceShape'
    }

    static glslClass() {
        return struct;
    }

    glslSDF() {
        return mustache.render(sdf, this);
    }

    glslGradient() {
        return mustache.render(gradient, this);
    }
}
