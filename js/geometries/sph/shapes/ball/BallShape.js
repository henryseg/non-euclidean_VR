import {mustache} from "../../../../lib/mustache.mjs";
import {Isometry, Point} from "../../geometry/General.js";
import {BasicShape} from "../../../../core/shapes/BasicShape.js";

import distance from "../../imports/distance.js";
import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";
import gradient from "./shaders/gradient.js";


/**
 * @class
 *
 * @classdesc
 * Shape of a spherical ball
 */
export class BallShape extends BasicShape {

    /**
     * Construction
     * @param {Point|Vector} center - data for the center of the ball
     * - If the input in a Point, then the center is that point.
     * - If the input is a Vector, then the center is the image of this vector by the exponential map at the origin.
     * @param {number} radius - the radius od the ball
     */
    constructor(center, radius) {
        super();
        this.addImport(distance);
        if (center.isPoint) {
            this.center = center;
        } else if (center.isVector) {
            const isom = new Isometry().makeTranslationFromDir(center);
            this.center = new Point().applyIsometry(isom);
        } else {
            throw new Error('BallShape: this type is not allowed');
        }
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