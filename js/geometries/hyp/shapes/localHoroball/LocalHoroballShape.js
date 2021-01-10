import {mustache} from "../../../../lib/mustache.mjs";
import {BasicShape} from "../../../../core/shapes/BasicShape.js";

import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";
import gradient from "./shaders/gradient.js";


/**
 * @class
 *
 * @classdesc
 * Shape of a hyperbolic local horoball
 */
export class LocalHoroballShape extends BasicShape {

    /**
     * Construction
     * @param {Vector} center - we identify the boundary, with the unit sphere in the tangent space at the origin.
     * @param {number} offset - the radius od the ball
     */
    constructor(center, offset) {
        super();
        this.addImport();
        /**
         * The "center" of the horoball.
         * We identify the boundary, with the unit sphere in the tangent space at the origin.
         * @type {Vector}
         */
        this.center = center;
        /**
         * Offset.
         * The offset correspond to the image of the origin, by the SDF of the horoball.
         * If the offset is positive, the origin is outside of the horoball
         * @type {number}
         */
        this.offset = offset;
    }

    /**
     * Says that the object inherits from `Ball`
     * @type {boolean}
     */
    get isLocalHoroballShape() {
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
        return 'LocalHoroballShape';
    }

    static glslClass() {
        return struct;
    }

    glslSDF() {
        return mustache.render(sdf, this);
    }

    // glslGradient() {
    //     return mustache.render(gradient, this);
    // }

}