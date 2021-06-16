import mustache from "mustache/mustache.mjs";

import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Isometry} from "../../geometry/Isometry.js";
import {Point} from "../../geometry/Point.js";

import distance from "../../imports/distance.js";
import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";
import gradient from "./shaders/gradient.js";
import uv from "./shaders/uv.js";

/**
 * @class
 *
 * @classdesc
 * Shape of a euclidean local ball
 * Variation using a directed signed distance function.
 * Be careful: it will probably require creeping, otherwise the light ray will jump from the current cell to infinity.
 */
export class LocalDirectedBallShape extends BasicShape {

    /**
     * Construction
     * @param {Isometry|Point} location - Either an isometry, or a point representing the center of the ball
     * @param {number} radius - the radius od the ball
     */
    constructor(location, radius) {
        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        }
        else if (location.isPoint) {
            isom.makeTranslation(location);
        }
        else {
            throw new Error('LocalBallShape: this type of location is not allowed');
        }
        super(isom);
        this.addImport(distance);
        this.radius = radius;
        this._center = undefined;
    }

    /**
     * Says that the object inherits from `Ball`
     * @type {boolean}
     */
    get isLocalBallShape() {
        return true;
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

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return false;
    }

    get uniformType() {
        return 'LocalDirectedBallShape';
    }

    /**
     * The UV coordinates corresponds to the spherical coordinates on the sphere...
     * Not sure if that is the smartest choice
     * @return {boolean}
     */
    get hasUVMap() {
        return true;
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

    glslUVMap() {
        return mustache.render(uv, this);
    }

}