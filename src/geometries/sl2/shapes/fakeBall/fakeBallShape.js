import mustache from "mustache/mustache.mjs";

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
 * Fake ball in SL(2,R).
 * The distance under-estimator is only correct at large scale
 */
export class FakeBallShape extends BasicShape {


    /**
     * Constructor.
     * @param {Isometry|Point|Vector} location - the location of the ball
     * @param {number} radius - the radius of the ball
     */
    constructor(location, radius) {
        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else if (location.isPoint) {
            isom.makeTranslation(location);
        } else if (location.isVector) {
            isom.makeTranslationFromDir(location)
        } else {
            throw new Error("FakeBallShape: the type of location is not implemented");
        }
        super(isom);
        this.addImport(fakeDistance);
        this.radius = radius;
        this._center = undefined;
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
        if (this._center === undefined) {
            this.updateData();
        }
        return this._center;
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