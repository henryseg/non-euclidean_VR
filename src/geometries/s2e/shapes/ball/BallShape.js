import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Isometry, Point} from "../../geometry/General.js";

import distance from "../../imports/distance.glsl";
import direction from "../../imports/direction.glsl";

import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";
import gradient from "../../../../core/shapes/shaders/gradient.glsl.mustache";


export class BallShape extends BasicShape {

    /**
     * Construction
     * @param {Isometry|Point|Vector} location - data for the center of the ball
     * @param {number} radius - the radius od the ball
     */
    constructor(location, radius) {

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
    get isBallShape() {
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
        return false;
    }


    get uniformType() {
        return 'BallShape';
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
}