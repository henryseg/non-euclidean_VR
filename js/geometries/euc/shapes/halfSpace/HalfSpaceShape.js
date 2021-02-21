import {mustache} from "../../../../lib/mustache.mjs";
import {Quaternion, Vector3} from "../../../../lib/three.module.js";

import {Point, Vector} from "../../geometry/General.js";
import {BasicShape} from "../../../../core/shapes/BasicShape.js";

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
     * @param {Isometry} isom - the location of the half space
     *
     * The half space is the image by isom of the half space {z < 0}
     * The UV directions are the images by isom of e_x and e_y
     */
    constructor(isom) {
        super(isom);
        this._pos = undefined;
        this._normal = undefined;
        this._uDir = undefined;
        this._vDir = undefined;
    }

    updateData() {
        super.updateData();
        this._pos = new Point().applyIsometry(this.absoluteIsom);
        this._normal = new Vector(0, 0, 1).applyMatrix4(this.absoluteIsom.matrix);
        this._uDir = new Vector(1, 0, 0).applyMatrix4(this.absoluteIsom.matrix);
        this._vDir = new Vector(0, 1, 0).applyMatrix4(this.absoluteIsom.matrix);
    }

    /**
     * A point on the boundary of the half space
     * @type {Point}
     */
    get pos() {
        if (this._pos === undefined) {
            this.updateData();
        }
        return this._pos;
    }

    /**
     * The coordinates of the normal vector to the half space
     * @type {Vector}
     */
    get normal() {
        if (this._normal === undefined) {
            this.updateData();
        }
        return this._normal;
    }

    /**
     * U-direction (for UV coordinates)
     * @type {Vector}
     */
    get uDir() {
        if (this._uDir === undefined) {
            this.updateData();
        }
        return this._uDir;
    }

    /**
     * V-direction (for UV coordinates)
     * @type {Vector}
     */
    get vDir() {
        if (this._vDir === undefined) {
            this.updateData();
        }
        return this._vDir;
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
