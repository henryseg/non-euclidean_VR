import {Vector2} from "three";

import {Isometry} from "../../geometry/Isometry.js";
import {Point} from "../../geometry/Point.js";
import {BasicShape} from "../../../../core/shapes/BasicShape.js";

import smoothMaxPoly from "../../../../commons/imports/smoothMaxPoly.glsl";
import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";
import gradient from "../../../../core/shapes/shaders/gradient.glsl.mustache";
import uv from "../../../../core/shapes/shaders/uv.glsl.mustache";


/**
 * @class
 *
 * @classdesc
 * Local z Axis in Sol.
 */
export class LocalZAxisShape extends BasicShape {

    /**
     * Constructor.
     * @param {Isometry|Point} location - the location of the rod (only the xy coordinates matter)
     * @param {Vector2|number} sides - the length of the xy-sides
     * @param {number} smoothness - the coefficient to smooth the side of the cube (exponential method)
     */
    constructor(location, sides, smoothness = 0.01) {
        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else if (location.isPoint) {
            isom.makeTranslation(location);
        } else {
            throw new Error("FakeBallShape: the type of location is not implemented");
        }
        super(isom);
        if (sides.isVector2) {
            this.sides = sides.clone();
        } else {
            this.sides = new Vector2(sides, sides);
        }
        this.addImport(smoothMaxPoly);
        this.smoothness = smoothness;
    }

    get isGlobal() {
        return false;
    }

    get isLocalZAxisShape() {
        return true;
    }

    get uniformType() {
        return 'LocalZAxisShape';
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