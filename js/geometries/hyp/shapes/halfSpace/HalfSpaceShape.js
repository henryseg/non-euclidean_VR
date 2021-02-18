import {mustache} from "../../../../lib/mustache.mjs";
import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Isometry, Point} from "../../geometry/General.js";

import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";
import gradient from "./shaders/gradient.js";
import {Vector4} from "../../../../lib/three.module.js";


/**
 * @class
 *
 * @classdesc
 * Half space in hyperbolic space
 */
export class HalfSpaceShape extends BasicShape {

    /**
     * Constructor.
     * The half space is the image by `isom` of the half space
     * - going through the origin
     * - whose normal vector is ez = [0,0,1,0]
     * @param {Isometry} isom - the isometry defining the position and orientation of the half space
     */
    constructor(isom = undefined) {
        super();
        this.isom = isom !== undefined ? isom : new Isometry();
    }

    get isHalfSpaceShape() {
        return true;
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    get uniformType() {
        return 'HalfSpaceShape';
    }

    /**
     * Compute the normal vector to the half space,
     * so that it can be passed to the shader.
     * The normal vector consists of the underlying point and the direction.
     * @type{{pos:Point, dir:Vector4}}
     */
    get normal() {
        const pos = new Point().applyIsometry(this.isom);
        const dir = new Vector4(0,0,1,0).applyMatrix4(this.isom.matrix);
        return {pos: pos, dir: dir};
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