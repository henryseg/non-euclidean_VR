import {Point, Vector} from "../../geometry/General.js";
import {BasicShape} from "../../../../core/shapes/BasicShape.js";

import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";
import gradient from "../../../../core/shapes/shaders/gradient.glsl.mustache";
import uv from "../../../../core/shapes/shaders/uv.glsl.mustache";


/**
 * @class
 *
 * Shape for a vertical half space in Nil
 */
export class VerticalHalfSpaceShape extends BasicShape {

    /**
     * Constructor.
     * The half space is the image by the given isometry of the half space {x < 0}
     * The UV directions are the images of e_y, e_z
     * @param {Isometry} isom - the location of the half space
     */
    constructor(isom) {
        super(isom);
        this._pos = undefined;
        this._normal = undefined;
        this._uDir = undefined;
        this._vDir = new Vector(0, 0, 1);
    }

    updateData() {
        super.updateData();

        this._pos = new Point().applyIsometry(this.absoluteIsom);
        this._pos.coords.setZ(0);

        this._normal = new Vector(1, 0, 0).applyMatrix4(this.absoluteIsom.matrix);
        this._normal.setZ(0);
        this._normal.normalize();

        this._uDir = new Vector(0, 1, 0).applyMatrix4(this.absoluteIsom.matrix);
        this._uDir.setZ(0);
        this._uDir.normalize();
    }

    /**
     * A point on the boundary of the half space
     */
    get pos() {
        if (this._pos === undefined) {
            this.updateData();
        }
        return this._pos;
    }

    /**
     * The normal to the half space
     */
    get normal() {
        if (this._normal === undefined) {
            this.updateData();
        }
        return this._normal;
    }

    get uDir() {
        if (this._uDir === undefined) {
            this.updateData();
        }
        return this._uDir;
    }

    get vDir() {
        return this._vDir;
    }


    get isGlobal() {
        return true;
    }

    get isVerticalHalfSpaceShape() {
        return true;
    }

    get hasUVMap() {
        return true;
    }

    get uniformType() {
        return 'VerticalHalfSpaceShape';
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