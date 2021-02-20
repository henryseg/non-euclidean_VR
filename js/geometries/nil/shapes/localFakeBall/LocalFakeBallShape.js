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
export class LocalFakeBallShape extends BasicShape {


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
            throw new Error("LocalFakeBallShape: the type of location is not implemented");
        }
        super();
        this.addImport(fakeDistance);
        this.radius = radius;
    }

    get center() {
        return new Point().applyIsometry(this.absoluteIsom);
    }

    get isGlobal() {
        return false;
    }

    get isLocalFakeBallShape() {
        return true;
    }

    get uniformType() {
        return 'LocalFakeBallShape';
    }

    static glslClass() {
        return struct;
    }

    glslSDF() {
        return mustache.render(sdf, this);
    }
}