import {Matrix4, Vector4} from "three";

import {Point, Vector} from "../../geometry/General.js";
import {BasicShape} from "../../../../core/shapes/BasicShape.js";

import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";
import gradient from "../../../../core/shapes/shaders/gradient.glsl.mustache";
import uv from "../../../../core/shapes/shaders/uv.glsl.mustache";


/**
 * @class
 *
 * @classdesc
 * Euclidean half space
 */
export class LocalZSlabShape extends BasicShape {

    /**
     * Constructor.
     * @param {Isometry} isom - the location of the half space
     * @param {number} thickness - the thickness of the slab
     *
     * The slab is the image by isom of the half space {abs(z) < thickness}
     * The UV directions are the images by isom of e_x and e_y
     */
    constructor(isom, thickness) {
        super(isom);
        this._origin = undefined;
        this._test = undefined;
        this._uDir = undefined;
        this._vDir = undefined;
        this.thickness = thickness
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
        return false;
    }

    get isLocalZHalfSpaceShape() {
        return true;
    }

    get hasUVMap() {
        return true;
    }

    get uniformType() {
        return 'LocalZSlabShape'
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
