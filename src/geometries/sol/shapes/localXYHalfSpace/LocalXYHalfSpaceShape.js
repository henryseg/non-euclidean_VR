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
 *  x half space (or y half space)
 */
export class LocalXYHalfSpaceShape extends BasicShape {

    /**
     * Constructor.
     * @param {Isometry} isom - the location of the half space
     *
     * The half space is the image by isom of the half space {x < 0}
     * In particular the half space {y < 0} can be obtained by applying a flip
     */
    constructor(isom) {
        super(isom);
        this._origin = undefined;
        this._testX = undefined;
        this._testZ = undefined;
        this._uDir = undefined;
        this._vDir = undefined;
    }

    updateData() {
        super.updateData();
        this._origin = new Point().applyIsometry(this.absoluteIsom);
        const aux = new Matrix4().copy(this.absoluteIsomInv.matrix).transpose();
        this._testX = new Vector4(1, 0, 0, 0).applyMatrix4(aux);
        this._testZ = new Vector4(0, 0, 1, 0).applyMatrix4(aux);
        this._uDir = new Vector(0, 1, 0).applyMatrix4(this.absoluteIsom.matrix);
        this._vDir = new Vector(0, 0, 1).applyMatrix4(this.absoluteIsom.matrix);
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
     * An auxiliary vector to compute the SDF
     * @type {Vector4}
     */
    get testX() {
        if (this._testX === undefined) {
            this.updateData();
        }
        return this._testX;
    }

    /**
     * An auxiliary vector to compute the SDF
     * @type {Vector4}
     */
    get testZ() {
        if (this._testZ === undefined) {
            this.updateData();
        }
        return this._testZ;
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

    get isLocalXYHalfSpaceShape() {
        return true;
    }

    get hasUVMap() {
        return true;
    }

    get uniformType() {
        return 'LocalXYHalfSpaceShape'
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
