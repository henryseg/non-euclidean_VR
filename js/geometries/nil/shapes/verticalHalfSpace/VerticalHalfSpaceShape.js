import {mustache} from "../../../../lib/mustache.mjs";

import {Point, Vector} from "../../geometry/General.js";
import {BasicShape} from "../../../../core/shapes/BasicShape.js";

import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";
import gradient from "./shaders/gradient.js";
import uv from "./shaders/uv.js";


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
     *
     * @todo If the normal gets updated (for instance during an animation), then the UV directions will not follow.
     */
    constructor(isom) {
        super(isom);
    }

    /**
     * A point on the boundary of the half space
     */
    get pos() {
        const res = new Point().applyIsometry(this.isom);
        res.coords.setZ(0);
        return res;
    }

    /**
     * The normal to the half space
     */
    get normal() {
        const res = new Vector(1, 0, 0).applyMatrix4(this.isom.matrix);
        res.setZ(0);
        res.normalize();
        return res;
    }

    get uDir() {
        const res = new Vector(0, 1, 0).applyMatrix4(this.isom.matrix);
        res.setZ(0);
        res.normalize();
        return res;
    }

    get vDir() {
        return new Vector(0, 0, 1);
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
        return mustache.render(sdf, this);
    }

    glslGradient() {
        return mustache.render(gradient, this);
    }

    glslUVMap() {
        return mustache.render(uv, this);
    }

}