import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {mustache} from "../../../../lib/mustache.mjs";

import fakeDistance from "../../imports/fakeDistance.js";
import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";
import {Isometry} from "../../../../core/geometry/Isometry.js";
import {Point} from "../../../../core/geometry/Point.js";

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
     * @param {Isometry|Point} location - the location of the potato
     * @param {number} radius - the radius of the ball
     * @param {number} coeff1 - the coefficient for the radial component
     * @param {number} coeff2 - the coefficient for the (fake) height component
     * @param {number} exp - the exponent
     */
    constructor(location, radius, coeff1, coeff2, exp) {
        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else if (location.isPoint) {
            isom.makeTranslation(location);
        } else {
            throw new Error("FakeBallShape: the type of location is not implemented");
        }
        super(isom);
        this.addImport(fakeDistance);
        this.radius = radius;
        this.coeff1 = coeff1;
        this.coeff2 = coeff2;
        this.exp = exp;
    }

    get center() {
        return new Point().applyIsometry(this.absoluteIsom);
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