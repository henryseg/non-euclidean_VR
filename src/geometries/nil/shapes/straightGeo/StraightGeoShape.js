import {Vector4} from "three";

import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Isometry} from "../../../../core/geometry/Isometry.js";
import {Point} from "../../../../core/geometry/Point.js";

import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";

/**
 * @class
 *
 * @classdesc
 * Straight geodesic in Nil, i.e. the image by an isometry the geodesic supported by the axis (Ox)
 */
export class StraightGeoShape extends BasicShape {

    /**
     * Constructor.
     * @param {Isometry} location - the location of the geodesic
     * @param {number} radius - the radius of the "cylinder" around the geodesic
     */
    constructor(location, radius) {
        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else {
            throw new Error("FakeBallShape: the type of location is not implemented");
        }
        super(isom);
        this.radius = radius;
        /**
         * @type {Object}
         * @private
         * A point on the (unique) vertical half plane containing the geodesic
         */
        this._pos = undefined;
        /**
         * @type {Vector4}
         * @private
         * The normal of the (unique) vertical half plane containing the geodesic
         */
        this._normal = undefined;
        /**
         * @type {Vector4}
         * @private
         * Normal to the geodesic, inside the vertical half plane containing it
         */
        this._trans = undefined;
    }

    updateData() {
        super.updateData();
        this._pos = new Point().applyIsometry(this.isom);
        this._pos.coords.setZ(0);
        this._normal = new Vector4(0, 1, 0, 0).applyMatrix4(this.isom.matrix);
        this._normal.setZ(0).normalize();
        const aux = this.isom.matrix.clone().invert().transpose();
        this._trans = new Vector4(0, 0, 1, 0).applyMatrix4(aux);
    }

    /**
     * A point on the (unique) vertical half plane containing the geodesic
     * @return {Object}
     */
    get pos() {
        if (this._pos === undefined) {
            this.updateData();
        }
        return this._pos;
    }

    /**
     * The normal to the (unique) vertical half plane containing the geodesic
     * @return {Object}
     */
    get normal() {
        if (this._normal === undefined) {
            this.updateData();
        }
        return this._normal;
    }

    /**
     * The Normal to the geodesic, inside the vertical half plane containing it
     * @return {Object}
     */
    get trans() {
        if (this._trans === undefined) {
            this.updateData();
        }
        return this._trans;
    }


    get isGlobal() {
        return true;
    }

    get isStraightGeoShape() {
        return true;
    }

    get uniformType() {
        return 'StraightGeoShape';
    }

    static glslClass() {
        return struct;
    }

    glslSDF() {
        return sdf(this);
    }
}