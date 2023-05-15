import {Vector4} from "three";

import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Point} from "../../geometry/Point.js";

import direction from "../../imports/direction.glsl";
import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";
import gradient from "../../../../core/shapes/shaders/numericalGradient.glsl.mustache";
// import gradient from "../../../../core/shapes/shaders/gradient.glsl.mustache";
import uv from "../../../../core/shapes/shaders/uv.glsl.mustache";



export class LocalHorizontalCylinderShape extends BasicShape {

    /**
     * Constructor
     * @param {Isometry} isom - the isometry defining the position of the cylinder.
     * @param {number} radius - the radius of the cylinder
     *
     * The cylinder is the image by isom of the cylinder going through the origin and directed by the vector (1,0,0)
     */
    constructor(isom, radius) {
        super(isom);
        this.radius = radius;
        this._vector = undefined;
        this.addImport(direction);
    }

    updateData() {
        super.updateData();
        const pos = new Point().applyIsometry(this.absoluteIsom);
        const dir = new Vector4(1, 0, 0, 0).applyMatrix4(this.absoluteIsom.matrix);
        this._vector = {pos: pos, dir: dir};
    }

    /**
     * Return the vector (point + direction) orienting the geodesic
     * Mainly used to pass data to the shader
     */
    get vector() {
        if (this._vector === undefined) {
            this.updateData();
        }
        return this._vector;
    }

    get isGlobal() {
        return false;
    }

    get hasUVMap() {
        return false;
    }

    get uniformType() {
        return 'LocalHorizontalCylinderShape';
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

    // glslUVMap() {
    //     return uv(this);
    // }
}