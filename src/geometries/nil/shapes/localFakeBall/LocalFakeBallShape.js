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
        this.radius = radius;this._center = undefined;
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