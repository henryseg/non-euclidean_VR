import {Vector4} from "three";

import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Isometry, Point} from "../../geometry/General.js";

import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";
import gradient from "../../../../core/shapes/shaders/gradient.glsl.mustache";
import uv from "../../../../core/shapes/shaders/uv.glsl.mustache";


/**
 * @class
 *
 * @classdesc
 * Slab around the horizontal hyperbolic plane {z = 0}
 */
export class LocalSlabShape extends BasicShape {

    /**
     * Constructor.
     * The slab is the image by `isom` of the slab
     * - going through the origin
     * - whose normal vector is ez = [0,0,1,0]
     * - with the given thickness
     * @param {Isometry} isom - the isometry defining the position and orientation of the half space
     * @param {number} thickness - the thickness of the slab
     */
    constructor(isom = undefined, thickness) {
        super(isom);
        this._normal = undefined;
        this.thickness = thickness;
    }

    updateData() {
        super.updateData();
        const pos = new Point().applyIsometry(this.absoluteIsom);
        const dir = new Vector4(0, 0, 1, 0).applyMatrix4(this.absoluteIsom.matrix);
        this._normal = {pos: pos, dir: dir};
    }

    /**
     * Compute the normal vector to the half space,
     * so that it can be passed to the shader.
     * The normal vector consists of the underlying point and the direction.
     * @type{{pos:Point, dir:Vector4}}
     */
    get normal() {
        if (this._normal === undefined) {
            this.updateData();
        }
        return this._normal;
    }

    get isLocalSlabShape() {
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
        return 'LocalSlabShape';
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