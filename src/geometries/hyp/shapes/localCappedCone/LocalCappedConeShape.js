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
 * Local cylinder in hyperbolic geometry
 */
export class LocalCappedConeShape extends BasicShape {

    /**
     * Constructor
     * @param {number|Vector2} radius - the radii of the cone (if a single value is passed, the top and bottom radii are the same)
     * @param {Isometry} isom - the isometry defining the position of the cylinder.
     * @param {number} height - height of the cylinder
     * @param {number} smoothness - smoothness of the edge (polynomial smooth max)
     * The cylinder is the image by isom of the cylinder going through the origin and directed by the vector (0,0,1)
     *
     */
    constructor(isom, radius, height, smoothness) {
        super(isom);
        this.addImport(distance, direction, smoothMaxPoly);
        if (radius.isVector2) {
            this.radius = radius.clone();
        } else {
            this.radius = new Vector2(radius, radius);
        }
        this.height = height;
        /**
         * Coordinates of the normal vector at the top cap of the cylinder (before applying isom)
         * @type {Vector4}
         */
        this.capTop = new Vector4(0, 0, Math.cosh(0.5 * height), Math.sinh(0.5 * height));
        /**
         * Coordinates of the normal vector at the bottom cap of the cylinder (before applying isom)
         * @type {Vector4}
         */
        this.capBtm = new Vector4(0, 0, -Math.cosh(0.5 * height), Math.sinh(0.5 * height));
        this.smoothness = smoothness;
        this._direction = undefined;
        this._testCapTop = undefined
        this._testCapBtm = undefined
    }

    updateData() {
        super.updateData();
        this._direction = {
            pos: new Point().applyIsometry(this.absoluteIsom),
            dir: new Vector4(0, 0, 1, 0).applyMatrix4(this.absoluteIsom.matrix)
        };
        this._testCapTop = this.capTop.clone().applyMatrix4(this.absoluteIsom.matrix);
        this._testCapBtm = this.capBtm.clone().applyMatrix4(this.absoluteIsom.matrix);
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
    get testCapTop() {
        if (this._testCapTop === undefined) {
            this.updateData();
        }
        return this._testCapTop;
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
        return 'LocalCappedConeShape';
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