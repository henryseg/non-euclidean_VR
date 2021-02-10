import {mustache} from "../../../../lib/mustache.mjs";
import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Quaternion, Vector3} from "../../../../lib/three.module.js";

import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";
import gradient from "./shaders/gradient.js";
import uv from "./shaders/uv.js";

const ex = new Vector3(1, 0, 0);
const ey = new Vector3(0, 1, 0);
const ez = new Vector3(0, 0, 1);

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
     * @param {Vector3} normal - the normal to the half space.
     *
     * The UV directions are computed as follows.
     * One first compute "the" rotation R sending e_z to normal.
     * Then uDir = Re_x and vDir = Re_y.
     *
     * @todo If the normal gets updated (for instance during an animation), then the UV directions will not follow.
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
         * @type {Vector3}
         */
        this.normal = normal.normalize();

        const q = new Quaternion().setFromUnitVectors(ez, this.normal);
        this.uDir = ex.clone().applyQuaternion(q);
        this.vDir = ey.clone().applyQuaternion(q);

    }

    get isGlobal() {
        return true;
    }

    get isHalfSpaceShape() {
        return true;
    }

    get hasUVMap() {
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

    glslUVMap() {
        return mustache.render(uv, this);
    }
}
