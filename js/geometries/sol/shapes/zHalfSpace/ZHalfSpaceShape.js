import {mustache} from "../../../../lib/mustache.mjs";
import {Matrix4, Vector3, Vector4} from "../../../../lib/threejs/build/three.module.js";

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
export class ZHalfSpaceShape extends BasicShape {

    /**
     * Constructor.
     * @param {Isometry} isom - the location of the half space
     *
     * The half space is the image by isom of the half space {z < 0}
     * The UV directions are the images by isom of e_x and e_y
     */
    constructor(isom) {
        super(isom);
        this._origin = undefined;
        this._test = undefined;
        this._uDir = undefined;
        this._vDir = undefined;
    }

    updateData() {
        super.updateData();
        this._origin = new Point().applyIsometry(this.absoluteIsom);
        const aux = new Matrix4().copy(this.absoluteIsomInv.matrix).transpose();
        this._test = new Vector4(0, 0, 1, 0).applyMatrix4(aux);
        this._uDir = new Vector(1, 0, 0).applyMatrix4(this.absoluteIsom.matrix);
        this._vDir = new Vector(0, 1, 0).applyMatrix4(this.absoluteIsom.matrix);
    }

    /**
     * The origin on the boundary of the half space
     * @type {Point}
     */
    get origin() {
        if (this._origin === undefined) {
            this.updateData();
        }
        return this._origin;
    }

    /**
     * A vector to compute the SDF
     * @type {Vector4}
     */
    get test() {
        if (this._test === undefined) {
            this.updateData();
        }
        return this._test;
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

    get isZHalfSpaceShape() {
        return true;
    }

    get hasUVMap() {
        return true;
    }

    get uniformType() {
        return 'ZHalfSpaceShape'
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
