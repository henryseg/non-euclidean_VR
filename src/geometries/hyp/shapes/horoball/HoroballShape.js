import {Quaternion, Vector3, Vector4} from "three";

import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Isometry} from "../../geometry/General.js";

import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";
import gradient from "../../../../core/shapes/shaders/gradient.glsl.mustache";


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
        } else {
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
        this._center = undefined;
    }

    updateData() {
        super.updateData();
        this._center = new Vector4(0, 0, 1, 1).applyMatrix4(this.absoluteIsom.matrix);
    }

    /**
     * Center of the ball (at infinity)
     * @type{Vector4}
     */
    get center() {
        if (this._center === undefined) {
            this.updateData();
        }
        return this._center;
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
        return sdf(this);
    }

    glslGradient() {
        return gradient(this);
    }

}