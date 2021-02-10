import {mustache} from "../../../../lib/mustache.mjs";
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
 * Shape of a euclidean local ball
 */
export class LocalBallShape extends BasicShape {

    /**
     * Construction
     * @param {Point} center - the center of the ball
     * @param {number} radius - the radius od the ball
     */
    constructor(center, radius) {
        super();
        this.addImport(distance);
        this.center = center;
        this.radius = radius;
    }

    /**
     * Says that the object inherits from `Ball`
     * @type {boolean}
     */
    get isLocalBallShape() {
        return true;
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return false;
    }

    get uniformType() {
        return 'LocalBallShape';
    }

    /**
     * The UV coordinates corresponds to the spherical coordinates on the sphere...
     * Not sure if that is the smartest choice
     * @return {boolean}
     */
    get hasUVMap(){
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