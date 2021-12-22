import {mustache} from "../../../../lib/mustache.mjs";
import {BasicShape} from "../../../../core/shapes/BasicShape.js";
import {Isometry, Point} from "../../geometry/General.js";

import distance from "../../imports/distance.js";
import direction from "../../imports/direction.js";

import struct from "./shaders/struct.js";
import sdf from "./shaders/sdf.js";
import gradient from "./shaders/gradient.js";


export class LocalBallShape extends BasicShape {


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
    get isLocalBallShape() {
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
        return false;
    }


    get uniformType() {
        return 'LocalBallShape';
    }

    static glslClass() {
        return struct;
    }

    glslGradient() {
        return mustache.render(gradient, this);
    }

    glslSDF() {
        return mustache.render(sdf, this);
    }


}