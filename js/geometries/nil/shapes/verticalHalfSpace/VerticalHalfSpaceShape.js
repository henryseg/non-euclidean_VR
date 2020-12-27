import {mustache} from "../../../../lib/mustache.mjs";
import {Quaternion, Vector2, Vector3, Vector4} from "../../../../lib/three.module.js";

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
 * Shape for a vertical half space in Nil
 */
export class VerticalHalfSpaceShape extends BasicShape {

    /**
     * Constructor.
     * The normal (in the extrinsic model)
     * @param {Point} pos - a point on the boundary of the half space
     * @param {Vector3} normal - the normal to the boundary of the half space (pointing outwards),
     * computed in the projective model.
     *
     * @todo If the normal gets updated (for instance during an animation), then the UV directions will not follow.
     */
    constructor(pos, normal) {
        super();
        this.pos = pos;
        this.normal = normal.normalize();

        const q = new Quaternion().setFromUnitVectors(ez, this.normal);
        this.uDir = ex.clone().applyQuaternion(q);
        this.vDir = ey.clone().applyQuaternion(q);
    }

    get isGlobal() {
        return true;
    }

    get isVerticalHalfSpaceShape() {
        return true;
    }

    get hasUVMap(){
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
        return mustache.render(uv,this);
    }

}