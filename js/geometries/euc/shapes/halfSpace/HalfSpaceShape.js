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
     * @param {Vector3} uDir - the direction of the u coordinates
     * @param {Vector3} vDir - the direction of the v coordinates
     *
     * If uDir and vDir are not provided they are computed as follows.
     * One first compute "the" rotation R sending e_z to normal.
     * Then uDir = Re_x and vDir = Re_y.
     */
    constructor(pos, normal, uDir = undefined, vDir = undefined) {
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

        const q = new Quaternion();
        if (uDir === undefined || vDir === undefined) {
            q.setFromUnitVectors(ez, this.normal);
        }
        if (uDir !== undefined) {
            this.uDir = uDir;
        } else {
            this.uDir = ex.clone().applyQuaternion(q);
        }
        if (vDir !== undefined) {
            this.vDir = vDir;
        } else {
            this.vDir = ey.clone().applyQuaternion(q);
        }
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
