import {Vector4} from "three";

import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Point} from "../../geometry/General.js";

import smoothMaxPoly from "../../../../commons/imports/smoothMaxPoly.glsl";
import distance from "../../imports/distance.glsl";
import direction from "../../imports/direction.glsl";
import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";
import gradient from "../../../../core/shapes/shaders/gradient.glsl.mustache";

/**
 * @class
 * @extends BasicShape
 *
 * @classdesc
 * Local cone with a half ball at the bottom
 */
export class LocalRoundConeShape extends BasicShape {

    /**
     * Constructor
     * The origin is at the center of the half ball (i.e. at the base of the cone)
     * @param {number} radius - the radius of the base of the cone
     * @param {Isometry} isom - the isometry defining the position of the cylinder.
     * @param {number} height - height of the cylinder
     * The cylinder is the image by isom of the cylinder going through the origin and directed by the vector (0,0,1)
     *
     */
    constructor(isom, radius, height) {
        super(isom);
        this.addImport(distance, direction, smoothMaxPoly);
        this.radius = radius;
        this.height = height;
        /**
         * Coordinates of the "normal" vector at the apex of the cone (before applying isom)
         * @type {Vector4}
         */
        this.nApex = new Vector4(0, 0, Math.cosh(height), Math.sinh(height));
        this._direction = undefined;
        this._testApex = undefined;
    }

    updateData() {
        super.updateData();
        this._direction = {
            pos: new Point().applyIsometry(this.absoluteIsom),
            dir: new Vector4(0, 0, 1, 0).applyMatrix4(this.absoluteIsom.matrix)
        };
        this._testApex = this.nApex.clone().applyMatrix4(this.absoluteIsom.matrix);
    }

    /**
     * Return the vector (point + direction) orienting the geodesic
     * Mainly used to pass data to the shader
     */
    get direction() {
        if (this._direction === undefined) {
            this.updateData();
        }
        return this._direction;
    }

    /**
     * Coordinated of the normal vector on the top cap of the cylinder
     * Used to compute the SDF
     */
    get testApex() {
        if (this._testApex === undefined) {
            this.updateData();
        }
        return this._testApex;
    }

    /**
     * Coordinated of the normal vector on the bottom cap of the cylinder
     * Used to compute the SDF
     */
    get testCapBtm() {
        if (this._testCapBtm === undefined) {
            this.updateData();
        }
        return this._testCapBtm;
    }

    get isGlobal() {
        return false;
    }

    get hasUVMap() {
        return false;
    }

    get uniformType() {
        return 'LocalRoundConeShape';
    }

    static glslClass() {
        return struct;
    }

    glslSDF() {
        return sdf(this);
    }

    // glslGradient() {
    //     return gradient(this);
    // }
}