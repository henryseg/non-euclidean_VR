import {Vector4} from "three";

import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Point} from "../../geometry/Point.js";

import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";
import gradient from "../../../../core/shapes/shaders/gradient.glsl.mustache";
import uv from "../../../../core/shapes/shaders/uv.glsl.mustache";

/**
 * @class
 * @extends BasicShape
 *
 * @classdesc
 * Cylinder in spherical geometry.
 */
export class CylinderShape extends BasicShape {

    /**
     * Constructor
     * The cylinder is the image by isom of the cylinder going through the origin and directed by e_z
     * The UV map takes value in [-pi, pi] x [-pi, pi]. It is computed as follows
     * - the u-coordinate is the distance between the origin and the projection of the on the "core" geodesic
     * - the v-coordinate is such that v = 0 correspond to the point in the e_y direction
     * @param {Isometry} isom - the position of the cylinder
     * @param {number} radius - the radius of the cylinder
     */
    constructor(isom, radius) {
        super(isom);
        this.radius = radius;
        this._direction = undefined;
        this._uvTestX = undefined;
        this._uvTestY = undefined;
    }

    updateData() {
        super.updateData();
        this._direction = {
            pos: new Point().applyIsometry(this.absoluteIsom),
            dir: new Vector4(0, 0, 1, 0).applyMatrix4(this.absoluteIsom.matrix)
        };
        this._uvTestX = new Vector4(1, 0, 0, 0).applyMatrix4(this.absoluteIsom.matrix);
        this._uvTestY = new Vector4(0, 1, 0, 0).applyMatrix4(this.absoluteIsom.matrix);
    }

    get direction() {
        if (this._direction === undefined) {
            this.updateData();
        }
        return this._direction;
    }

    get uvTestX() {
        if (this._uvTestX === undefined) {
            this.updateData();
        }
        return this._uvTestX;
    }

    get uvTestY() {
        if (this._uvTestY === undefined) {
            this.updateData();
        }
        return this._uvTestY;
    }

    get isCylinderShape() {
        return true;
    }

    get isGlobal() {
        return true;
    }

    get hasUVMap() {
        return true;
    }

    get uniformType() {
        return 'CylinderShape';
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