import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Isometry, Point} from "../../geometry/General.js";

import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";
import gradient from "../../../../core/shapes/shaders/gradient.glsl.mustache";
import uv from "../../../../core/shapes/shaders/uv.glsl.mustache";


export class StackWSlabShape extends BasicShape {

    /**
     * Construction
     * (Image by the isometry of the) slab  with equation {|w| < thickness}.
     * @param {Isometry} location - data for the center of the ball
     * @param {number} thickness - thickness of the slab
     * @param {number} height - height between two slabs
     */
    constructor(location,thickness,height) {

        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else {
            throw new Error("StackWSlabShape: this type of location is not implemented");
        }

        super(isom);
        this.thickness = thickness;
        this.height = height;
        this._origin = undefined;
    }

    updateData() {
        super.updateData();
        this._origin = new Point().applyIsometry(this.absoluteIsom);
    }

    get origin() {
        if (this._origin === undefined) {
            this.updateData();
        }
        return this._origin;
    }

    /**
     * Says that the object inherits from `LocalWHalfSpaceShape`
     * @type {boolean}
     */
    get isStackWSlabShape() {
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
        return 'LocalWSlabShape';
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