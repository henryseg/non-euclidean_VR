import {mustache} from "../../../../lib/mustache.mjs";
import {Isometry, Point} from "../../geometry/General.js";
import {BasicShape} from "../../../../core/shapes/BasicShape.js";

import distance from "../../imports/distance.js";
import direction from "../../imports/direction.js";
import normalFrame from "../../imports/normalFrame.js";

import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";
import gradient from "./shaders/gradient.js";
import uv from "./shaders/uv.js";


/**
 * @class
 *
 * @classdesc
 * New version for the the shape of a hyperbolic ball
 * The data stored are an isometry and a radius
 * The ball is the one centered at the image of the origin by the given isometry
 * The shader represent the object in the old-fashioned way: center and radius.
 */
export class NewBallShape extends BasicShape {

    /**
     * Construction
     * @param {Isometry} isom - isometry defining the position of the ball
     * @param {number} radius - the radius od the ball
     */
    constructor(isom, radius) {
        super();
        this.addImport(distance, direction, normalFrame);
        this.isom = isom;
        this.radius = radius;
    }

    /**
     * Says that the object inherits from `Ball`
     * @type {boolean}
     */
    get isBallShape() {
        return true;
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    get hasUVMap() {
        return true;
    }

    get uniformType() {
        return 'NewBallShape';
    }

    /**
     * Compute the center of the ball (to be passed to the shader)
     * @type{Point}
     */
    get center() {
        const center = new Point().applyIsometry(this.isom);
        //console.log(center.coords.toLog())
        return center;
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