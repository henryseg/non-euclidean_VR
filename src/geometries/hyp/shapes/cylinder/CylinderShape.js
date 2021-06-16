import {Vector4} from "three";
import mustache from "mustache/mustache.mjs";

import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Point} from "../../geometry/General.js";

import direction from "../../imports/direction.js";
import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";
import gradient from "./shaders/gradient.js";


export class CylinderShape extends BasicShape {

    /**
     * Constructor
     * @param {number} radius - the radius of the cylinder
     * @param {Isometry} isom - the isometry defining the position of the cylinder.
     * The cylinder is the image by isom of the cylinder going through the origin and directed by the vector (0,0,1)
     */
    constructor(isom, radius) {
        super(isom);
        this.addImport(direction);
        this.radius = radius;
        this._vector = undefined;
    }

    updateData() {
        super.updateData();
        const pos = new Point().applyIsometry(this.absoluteIsom);
        const dir = new Vector4(0, 0, 1, 0).applyMatrix4(this.absoluteIsom.matrix);
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
        return true;
    }

    get hasUVMap() {
        return false;
    }

    get uniformType() {
        return 'CylinderShape';
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