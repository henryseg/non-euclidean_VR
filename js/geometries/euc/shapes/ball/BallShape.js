import {mustache} from "../../../../lib/mustache.mjs";
import {BasicShape} from "../../../../core/shapes/BasicShape.js";

import distance from "../../imports/distance.js";
import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";
import gradient from "./shaders/gradient.js";


export class BallShape extends BasicShape {

    /**
     * Construction
     * @param {Point} center - the center of the ball
     * @param {number} radius - the radius od the ball
     */
    constructor(center, radius) {
        super();
        this.addImport(distance);
        this.center = center;
        this.radius = radius;
    }

    /**
     * Says that the object inherits from `Ball`
     * @type {boolean}
     */
    get isBallShape() {
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
        return 'BallShape';
    }

    static glslStruct() {
        return struct;
    }

    glslSDF() {
        return mustache.render(sdf, this);
    }

    glslGradient() {
        return mustache.render(gradient, this);
    }

}