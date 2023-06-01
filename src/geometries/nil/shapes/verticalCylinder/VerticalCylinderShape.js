import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Isometry, Point} from "../../geometry/General.js";

import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";
import gradient from "../../../../core/shapes/shaders/gradient.glsl.mustache";

/**
 * @class
 *
 * @classdesc
 * Vertical cylinder
 *
 * @todo Implement UV maps
 */
export class VerticalCylinderShape extends BasicShape {

    /**
     * The cylinder is the image by `isom` of the vertical cylinder (i.e. around the z-axis) going through the origin
     * @param {number} radius - radius of the cylinder
     * @param {Isometry} isom - isometry used to locate the cylinder
     */
    constructor(isom, radius) {
        super();
        this.radius = radius;
        this.isom = isom;
        this._pos = undefined;
    }

    updateData() {
        super.updateData();
        this._pos = new Point().applyIsometry(this.absoluteIsom);
        this._pos.coords.setZ(0);
    }

    /**
     * point on the center of the cylinder
     * @type {Point}
     */
    get pos() {
        if (this._pos === undefined) {
            this.updateData();
        }
        return this._pos;
    }

    get isGlobal() {
        return true;
    }

    get hasUVMap() {
        return false
    }

    get uniformType() {
        return 'VerticalCylinderShape';
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
}