import {mustache} from "../../../../lib/mustache.mjs";

import {Isometry, Point} from "../../geometry/General.js";
import {BasicShape} from "../../../../core/shapes/BasicShape.js";

import distance from "../../imports/distance.js";
import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";
import gradient from "./shaders/gradient.js";
import uv from "./shaders/uv.js";


/**
 * @class
 *
 * @classdesc
 * Shape of a euclidean box
 */
export class BoxShape extends BasicShape {

    /**
     * Construction
     * @param {Isometry|Point} location - Either an isometry, or a point representing the center of the ball
     * @param {Vector3} sides - the side lengths of the box
     * * @param {float} rounded - if the box is rounded
     */
    constructor(location, sides, rounded) {
        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else if (location.isPoint) {
            isom.makeTranslation(location);
        } else {
            throw new Error('BallShape: this type of location is not allowed');
        }
        super(isom);
        this.addImport(distance);
        this.sides = sides;
        this.rounded = rounded;
        this._center = undefined;
        this.updateData();
    }

    /**
     * Says that the object inherits from `BallShape`
     * *STEVE: I DONT KNOW IF I SHOULD KEEP THIS?
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
        if (this._center === undefined) {
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
        return 'BoxShape';
    }

    /**
     * The UV coordinates corresponds to the spherical coordinates on the sphere...
     * Not sure if that is the smartest choice
     * @return {boolean}
     */
    get hasUVMap() {
        return false;
    }

    static glslClass() {
        return struct;
    }

    glslSDF() {
        return mustache.render(sdf, this);
    }

    // glslGradient() {
    //     return mustache.render(gradient, this);
    // }

    // glslUVMap() {
    //     return mustache.render(uv, this);
    // }
}