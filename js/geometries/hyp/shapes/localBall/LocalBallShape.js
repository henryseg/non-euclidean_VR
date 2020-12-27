import {mustache} from "../../../../lib/mustache.mjs";
import {Isometry, Point} from "../../geometry/General.js";
import {BasicShape} from "../../../../core/shapes/BasicShape.js";

import distance from "../../imports/distance.js";
import direction from "../../imports/direction.js";
import normalFrame from "../../imports/normalFrame.js";

import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";
import gradient from "./shaders/gradient.js";
import uv from "../ball/shaders/uv.js";



/**
 * @class
 *
 * @classdesc
 * Shape of a hyperbolic local ball
 */
export class LocalBallShape extends BasicShape {

    /**
     * Construction
     * @param {Point|Vector} center - data for the center of the ball
     * - If the input in a Point, then the center is that point.
     * - If the input is a Vector, then the center is the image of this vector by the exponential map at the origin.
     * @param {number} radius - the radius od the ball
     */
    constructor(center, radius) {
        super();
        this.addImport(distance, direction, normalFrame);
        if (center.isPoint) {
            this.center = center;
        } else if (center.isVector) {
            const isom = new Isometry().makeTranslationFromDir(center);
            this.center = new Point().applyIsometry(isom);
        } else {
            throw new Error('LocalBallShape: this type is not allowed');
        }
        this.radius = radius;
    }

    /**
     * Says that the object inherits from `Ball`
     * @type {boolean}
     */
    get isLocalBallShape() {
        return true;
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return false;
    }

    get hasUVMap() {
        return true;
    }

    get uniformType() {
        return 'LocalBallShape';
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