import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import mustache from "mustache/mustache.mjs";

import fakeDistance from "../../imports/fakeDistance.glsl";
import struct from "./shaders/struct.glsl";
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
export class PotatoShape extends BasicShape {

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
        this.exp = exp;this._center = undefined;
    }

    updateData() {
        super.updateData();
        this._center = new Point().applyIsometry(this.absoluteIsom);
    }

    /**
     * Center of the ball
     * @type {Point}
     */
    get center() {
        if(this._center === undefined) {
            this.updateData();
        }
        return this._center;
    }

    get isGlobal() {
        return true;
    }

    get isLocalPotatoShape() {
        return true;
    }

    get uniformType() {
        return 'PotatoShape';
    }

    static glslClass() {
        return struct;
    }

    glslSDF() {
        return mustache.render(sdf, this);
    }
}