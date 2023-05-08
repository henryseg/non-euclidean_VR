import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Isometry, Point} from "../../geometry/General.js";

import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";
// import gradient from "../../../../core/shapes/shaders/numericalGradient.glsl.mustache";
import gradient from "../../../../core/shapes/shaders/gradient.glsl.mustache";
import uv from "../../../../core/shapes/shaders/uv.glsl.mustache";
import distance from "../../imports/distance.glsl";
import direction from "../../imports/direction.glsl";


export class WCylinderShape extends BasicShape {

    /**
     * Construction
     * (Image by the isometry of the) cylinder around the w-axis.
     * @param {Isometry} location - data for the position of the cylinder
     * @param {number} radius - radius of the cylinder
     */
    constructor(location, radius) {

        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else {
            throw new Error("WCylinderShape: this type of location is not implemented");
        }

        super(isom);
        this.addImport(distance, direction);

        this.radius = radius;
        this._center = undefined;
    }

    updateData() {
        super.updateData();
        this._center = new Point().applyIsometry(this.absoluteIsom);
    }

    get center() {
        if (this._center === undefined) {
            this.updateData();
        }
        return this._center;
    }

    /**
     * Says that the object inherits from `Ball`
     * @type {boolean}
     */
    get isWCylinderShape() {
        return true;
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    get hasUVMap() {
        return true;
    }

    get uniformType() {
        return 'WCylinderShape';
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