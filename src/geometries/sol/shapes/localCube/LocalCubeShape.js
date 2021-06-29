import {Matrix4, Vector4} from "three";

import {Isometry} from "../../geometry/Isometry.js";
import {Point} from "../../geometry/Point.js";
import {BasicShape} from "../../../../core/shapes/BasicShape.js";

import struct from "./shaders/struct.glsl";
import sdf from "../../../../core/shapes/shaders/sdf.glsl.mustache";
import gradient from "../../../../core/shapes/shaders/gradient.glsl.mustache";


/**
 * @class
 *
 * @classdesc
 * Local cube in Sol.
 */
export class LocalCubeShape extends BasicShape {

    /**
     * Constructor.
     * @param {Isometry|Point} location - the location of the cube
     * @param {Vector3} sides - the length of the sides
     */
    constructor(location, sides) {
        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else if (location.isPoint) {
            isom.makeTranslation(location);
        } else {
            throw new Error("FakeBallShape: the type of location is not implemented");
        }
        super(isom);
        this.sides = sides;
        this._origin = undefined;
        this._testX = undefined;
        this._testY = undefined;
        this._testZ = undefined;
    }

    updateData() {
        super.updateData();
        this._origin = new Point().applyIsometry(this.absoluteIsom);
        const aux = new Matrix4().copy(this.absoluteIsomInv.matrix).transpose();
        this._testX = new Vector4(1, 0, 0, 0).applyMatrix4(aux);
        this._testY = new Vector4(0, 1, 0, 0).applyMatrix4(aux);
        this._testZ = new Vector4(0, 0, 1, 0).applyMatrix4(aux);
    }

    /**
     * A vector to compute the SDF
     * @type {Vector4}
     */
    get testX() {
        if (this._testX === undefined) {
            this.updateData();
        }
        return this._testX;
    }

    /**
     * A vector to compute the SDF
     * @type {Vector4}
     */
    get testY() {
        if (this._testY === undefined) {
            this.updateData();
        }
        return this._testY;
    }

    /**
     * A vector to compute the SDF
     * @type {Vector4}
     */
    get testZ() {
        if (this._testZ === undefined) {
            this.updateData();
        }
        return this._testZ;
    }

    get isGlobal() {
        return false;
    }

    get isLocalCube() {
        return true;
    }

    get uniformType() {
        return 'LocalCube';
    }

    static glslClass() {
        return struct;
    }

    glslSDF() {
        return sdf(this);
    }

    // glslGradient() {
    //     return gradient(this);
    // }
}