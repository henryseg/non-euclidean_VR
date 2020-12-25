import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {mustache} from "../../../../lib/mustache.mjs";

import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";


/**
 * @class
 *
 * @classdesc
 * Fake ball using the euclidean SDF (!)
 */
export class VeryFakeBallShape extends BasicShape{

    constructor(center, radius) {
        super();
        this.center = center;
        this.radius = radius;
    }

    /**
     * Says that the object inherits from `Ball`
     * @type {boolean}
     */
    get isVeryFakeBallShape() {
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
        return 'VeryFakeBallShape';
    }

    static glslClass() {
        return struct;
    }

    glslSDF() {
        return mustache.render(sdf, this);
    }
}