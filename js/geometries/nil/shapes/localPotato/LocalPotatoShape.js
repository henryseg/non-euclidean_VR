import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {mustache} from "../../../../lib/mustache.mjs";

import fakeDistance from "../../imports/fakeDistance.js";
import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";

/**
 * @class
 *
 * @classdesc
 * Fake ball in Nil.
 * The distance under-estimator is only correct at large scale
 */
export class LocalPotatoShape extends BasicShape {

    /**
     * Constructor.
     * @param {Point} center - the center of the ball
     * @param {number} radius - the radius of the ball
     * @param {number} coeff1 - the coefficient for the radial component
     * @param {number} coeff2 - the coefficient for the (fake) height component
     * @param {number} exp - the exponent
     */
    constructor(center, radius, coeff1, coeff2, exp) {
        super();
        this.addImport(fakeDistance);
        this.center = center;
        this.radius = radius;
        this.coeff1 = coeff1;
        this.coeff2 = coeff2;
        this.exp = exp;
    }

    get isGlobal() {
        return false;
    }

    get isLocalPotatoShape() {
        return true;
    }

    get uniformType() {
        return 'LocalPotatoShape';
    }

    static glslClass() {
        return struct;
    }

    glslSDF() {
        return mustache.render(sdf, this);
    }
}