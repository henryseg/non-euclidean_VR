import {mustache} from "../../../../lib/mustache.mjs";

import {Isometry} from "../../geometry/Isometry.js";
import {Point} from "../../geometry/Point.js";
import {BasicShape} from "../../../../core/shapes/BasicShape.js";

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
export class FakeBallShape extends BasicShape {


    /**
     * Constructor.
     * @param {Isometry|Point} location - the location of the ball
     * @param {number} radius - the radius of the ball
     */
    constructor(location, radius) {
        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else if (location.isPoint) {
            isom.makeTranslation(location);
        } else {
            throw new Error("FakeBallShape: the type of location is not implemented");
        }
        super();
        this.addImport(fakeDistance);
        this.radius = radius;
    }

    get center() {
        return new Point().applyIsometry(this.isom);
    }

    get isGlobal() {
        return true;
    }

    get isFakeBallShape() {
        return true;
    }

    get uniformType() {
        return 'FakeBallShape';
    }

    static glslClass() {
        return struct;
    }

    glslSDF() {
        return mustache.render(sdf, this);
    }
}