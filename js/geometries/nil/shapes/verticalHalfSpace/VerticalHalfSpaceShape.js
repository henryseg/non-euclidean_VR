import {mustache} from "../../../../lib/mustache.mjs";
import {Vector2, Vector3, Vector4} from "../../../../lib/three.module.js";

import {BasicShape} from "../../../../core/shapes/BasicShape.js";

import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";
import gradient from "./shaders/gradient.js";

/**
 * @class
 *
 * Shape for a vertical half space in Nil
 */
export class VerticalHalfSpaceShape extends BasicShape {

    /**
     * Constructor.
     * The normal (in the extrinsic model)
     * @param {Point} pos - a point on the boundary of the half space
     * @param {Vector4|Vector3|Vector2} normal - the normal to the boundary of the half space (pointing outwards).
     * On the x,y coordinates matter (and are stored as a field)
     */
    constructor(pos, normal) {
        super();
        this.pos = pos;
        this.normal = new Vector4(normal.x, normal.y, 0, 0).normalize();
    }

    get isGlobal() {
        return true;
    }

    get isVerticalHalfSpaceShape() {
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

}