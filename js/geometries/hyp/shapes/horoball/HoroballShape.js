import {mustache} from "../../../../lib/mustache.mjs";
import {Quaternion, Vector3, Vector4} from "../../../../lib/three.module.js";

import {BasicShape} from "../../../../core/shapes/BasicShape.js";

import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";
import gradient from "./shaders/gradient.js";
import {Isometry} from "../../geometry/General.js";


/**
 * @class
 *
 * @classdesc
 * Shape of a hyperbolic horoball
 */
export class HoroballShape extends BasicShape {

    /**
     * Construction
     * @param {Isometry|Vector3} location - the location of the horoball.
     * - if location is an Isometry, then the horoball is the image by this isometry of the horoball centered at the point [0,0,1,1]
     * - if location is a Vector3, then the horoball is centered at [u_x, u_y,u_z, 1], where u = (u_x,u_y_u_z) is unit vector in the same direction.
     * (seen as a point in the boundary at infinity of H3 in the hyperboloid model)
     * @param {number} offset - the radius od the ball
     */
    constructor(location, offset) {
        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else if (location.isVector3) {
            const u = location.clone().normalize();
            const q = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), u);
            isom.matrix.makeRotationFromQuaternion(q);
        } else{
            throw new Error("HoroballShape: this type of location is not implemented");
        }
        super(isom);
        this.addImport();
        /**
         * Offset.
         * The offset correspond to the image of the origin, by the SDF of the horoball.
         * If the offset is positive, the origin is outside of the horoball
         * @type {number}
         */
        this.offset = offset;
    }

    /**
     * Center of the ball (at infinity)
     * @type{Vector4}
     */
    get center() {
        return new Vector4(0, 0, 1, 1).applyMatrix4(this.isom.matrix)
    }

    /**
     * Says that the object inherits from `HoroballShape`
     * @type {boolean}
     */
    get isHoroballShape() {
        return true;
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    get uniformType() {
        return 'HoroballShape';
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

}