import {Matrix4, Vector4, Vector2} from "three";

import {Isometry} from "../../geometry/Isometry.js";
import {Point} from "../../geometry/Point.js";
import {BasicShape} from "../../../../core/shapes/BasicShape.js";

import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";
import gradient from "../../../../core/shapes/shaders/gradient.glsl.mustache";
import uv from "../../../../core/shapes/shaders/uv.glsl.mustache";


/**
 * @class
 *
 * @classdesc
 * Local x Axis in Sol.
 */
export class LocalXAxisShape extends BasicShape {

    /**
     * Constructor.
     * @param {Isometry|Point} location - the location of the axis
     * @param {number} radius - the radius of the cylinder around the axis
     */
    constructor(location, radius) {
        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else if (location.isPoint) {
            isom.makeTranslation(location);
        } else {
            throw new Error("FakeBallShape: the type of location is not implemented");
        }
        super(isom);
        this.radius = radius;
    }

    get isGlobal() {
        return false;
    }

    get isLocalXAxisShape() {
        return true;
    }

    get uniformType() {
        return 'LocalXAxisShape';
    }

    get hasUVMap() {
        return true;
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