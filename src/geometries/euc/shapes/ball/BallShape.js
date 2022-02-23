import {Isometry} from "../../geometry/Isometry.js";
import {Point} from "../../geometry/Point.js";
import {BasicShape} from "../../../../core/shapes/BasicShape.js";

import distance from "../../imports/distance.glsl";
import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";
import gradient from "../../../../core/shapes/shaders/gradient.glsl.mustache";
import uv from "../../../../core/shapes/shaders/uv.glsl.mustache";



/**
 * @class
 *
 * @classdesc
 * Shape of a euclidean ball
 */
export class BallShape extends BasicShape {

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
            throw new Error('BallShape: this type of location is not allowed');
        }
        super(isom);
        this.addImport(distance);
        this.radius = radius;
        this._center = undefined;
        this.updateData();
    }

    /**
     * Says that the object inherits from `BallShape`
     * @type {boolean}
     */
    get isBallShape() {
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
        return true;
    }

    get uniformType() {
        return 'BallShape';
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
        return sdf(this);
    }

    glslGradient() {
        return gradient(this);
    }

    glslUVMap() {
        return uv(this);
    }
}