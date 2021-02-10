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
export class LocalFakeBallShape extends BasicShape {


    /**
     * Constructor.
     * @param {Point} center - the center of the ball
     * @param {number} radius - the radius of the ball
     */
    constructor(center, radius) {
        super();
        this.addImport(fakeDistance);
        this.center = center;
        this.radius = radius;
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