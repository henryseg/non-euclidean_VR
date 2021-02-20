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
     * @param {Isometry|Point|Vector} location - data for the center of the ball
     * - If the input in an Isometry, then the center is the image of the origin by this isometry.
     * - If the input in a Point, then the center is that point.
     * - If the input is a Vector, then the center is the image of this vector by the exponential map at the origin.
     * @param {number} radius - the radius od the ball
     */
    constructor(location, radius) {
        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else if (location.isPoint) {
            isom.makeTranslation(location);
        } else if (location.isVector) {
            isom.makeTranslationFromDir(location);
        } else {
            throw new Error('BallShape: this type of location is not allowed');
        }
        super(isom);
        this.addImport(distance);
        this.radius = radius;
    }

    /**
     * Center of the ball
     * @type {Point}
     */
    get center() {
        return new Point().applyIsometry(this.isom);
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