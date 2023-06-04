import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Isometry, Point} from "../../geometry/General.js";

import distance from "../../imports/distance.glsl";
import direction from "../../imports/direction.glsl";

import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";
import gradient from "../../../../core/shapes/shaders/gradient.glsl.mustache";
import uv from "../../../../core/shapes/shaders/uv.glsl.mustache";


export class LocalStackBallShape extends BasicShape {


    /**
     * Construction
     * @param {Isometry|Point|Vector} location - data for the center of the ball
     * @param {number} radius - the radius od the ball
     * @param {number} height - height between two balls
     *
     */
    constructor(location, radius,height) {

        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else if (location.isPoint) {
            isom.makeTranslation(location);
        } else if (location.isVector) {
            isom.makeTranslationFromDir(location);
        } else {
            throw new Error("BallShape: this type of location is not implemented");
        }

        super(isom);
        this.addImport(distance, direction);
        this.radius = radius;
        this.height = height;
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
    get isLocalStackBallShape() {
        return true;
    }


    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return false;
    }


    get hasUVMap() {
        return true;
    }


    get uniformType() {
        return 'LocalStackBallShape';
    }

    static glslClass() {
        return struct;
    }

    glslGradient() {
        return sdf(this);
    }

    glslSDF() {
        return gradient(this);
    }

    glslUVMap() {
        return uv(this);
    }


}