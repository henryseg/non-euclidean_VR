import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {mustache} from "../../../../lib/mustache.mjs";

import fakeDistance from "../../imports/fakeDistance.js";
import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";
import {Point} from "../../geometry/General.js";

/**
 * @class
 *
 * @classdesc
 * Fake ball in Nil.
 * The distance under-estimator is only correct at large scale
 */
export class NewFakeBallShape extends BasicShape {


    /**
     * Constructor.
     * @param {Isometry} isom - isometry defining the center of the ball
     * @param {number} radius - the radius of the ball
     */
    constructor(isom, radius) {
        super();
        this.addImport(fakeDistance);
        this.isom = isom;
        this.radius = radius;
    }

    get center(){
        return new Point().applyIsometry(this.isom);
    }

    get isGlobal() {
        return true;
    }

    get isNewFakeBallShape() {
        return true;
    }

    get uniformType() {
        return 'NewFakeBallShape';
    }

    static glslClass() {
        return struct;
    }

    glslSDF() {
        return mustache.render(sdf, this);
    }
}