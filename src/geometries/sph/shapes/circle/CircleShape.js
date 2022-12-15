import {Vector4} from "three";

import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Point} from "../../geometry/Point.js";

import direction from "../../imports/direction.glsl";
import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";
import gradient from "../../../../core/shapes/shaders/gradient.glsl.mustache";
import uv from "../../../../core/shapes/shaders/uv.glsl.mustache";

/**
 * @class
 * @extends BasicShape
 *
 * @classdesc
 * Cylinder around a circle of the form z = cst and w = cst
 * Used for instance to draw a wireframe version of the Clifford torus
 */
export class CircleShape extends BasicShape {

    /**
     * Constructor
     * The cylinder is the image by isom of the cylinder given by the equations z = cz and w = cw
     * The UV map takes value in [-pi, pi] x [-pi, pi]. It is computed as follows
     * - the u-coordinate is the distance between the origin and the projection of the on the "core" circle
     * - the v-coordinate is such that v = 0 correspond to the point in the e_y direction
     * @param {Isometry} isom - the position of the cylinder
     * @param {number} cz - value of the z-coordinate
     * @param {number} cw - value of the w-coordinate
     * @param {number} radius - the radius of the cylinder around the curve
     */
    constructor(isom, cz, cw, radius) {
        super(isom);
        this.addImport(direction);
        const cAux = cz * cz + cw * cw;
        if (cAux > 1) {
            throw new Error('CircleShape: the circle in not on the sphere');
        }
        const cx = Math.sqrt(1 - cAux);
        this.c = new Vector4(cx, cx, cz, cw);
        this.radius = radius;
        this.updateData();

    }

    updateData() {
        super.updateData();
    }

    get isCircleShape() {
        return true;
    }

    get isGlobal() {
        return true;
    }

    get hasUVMap() {
        return true;
    }

    get uniformType() {
        return 'CircleShape';
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