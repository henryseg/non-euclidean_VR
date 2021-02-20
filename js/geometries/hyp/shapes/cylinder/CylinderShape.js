import {mustache} from "../../../../lib/mustache.mjs";

import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Point} from "../../geometry/General.js";
import {Vector4} from "../../../../lib/three.module.js";

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

    /**
     * A point the cylinder goes through
     * @type {Point}
     */
    get point() {
        return new Point().applyIsometry(this.isom);
    }

    /**
     * Return the vector at `point` directing the cylinder
     * @tyoe {Vector4}
     */
    get dir() {
        return new Vector4(0, 0, 1, 0).applyMatrix4(this.isom.matrix);
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