import {Vector4} from "three";

import {Point} from "../../../core/geometry/Point.js";
import {SL2} from "./Utils.js";


Point.prototype.build = function () {
    if (arguments.length === 0) {
        this.proj = new SL2();
        this.fiber = 0;
    } else {
        this.proj = new SL2(...arguments);
        this.fiber = arguments[4];
    }
}

Point.prototype.set = function (x, y, z, w, fiber) {
    this.proj.set(x, y, z, w);
    this.fiber = fiber;
    return this;
}

/**
 * For the explanation how the isometry acts, see the Jupyter notebook
 * @param {Isometry} isom - the isometry to apply
 * @return {Point} the current point
 */
Point.prototype.applyIsometry = function (isom) {
    this.proj.applyMatrix4(isom.matrix);
    const dir = isom.doesFlip() ? -1 : 1;
    const aux = this.proj.clone();
    aux.translateFiberBy(-isom.fiber - dir * this.fiber);
    this.fiber = isom.fiber + dir * this.fiber + 2 * Math.atan2(aux.y, aux.x);
    return this;
}

/**
 * Return the current point as an element (x,y,z,w) of H^2 x R, where
 * - (x,y,z) are th coordinates of a point of H^2 with the hyperboloid model
 * - w is the fiber component
 * @returns {Vector4}
 */
Point.prototype.toVector4 = function () {
    let aux = this.proj.toH2();
    return new Vector4(aux.x, aux.y, aux.z, this.fiber);

}

/**
 * Change of model:
 * Update the current point from a vector 4 (x,y,z,w)
 * the input is a vector (x,y,z,w) representing a point p where
 * - (x,y,z) is the projection of p in H^2 (hyperboloid model)
 * - w is the fiber coordinate
 * @param {Vector4} v - the input vector
 * @return {Point}
 */
Point.prototype.fromVector4 = function (v) {
    const [x, y, z, w] = v.toArray();
    this.fiber = w;
    this.proj.set(
        Math.sqrt(0.5 * z + 0.5),
        0,
        x / Math.sqrt(2 * z + 2),
        y / Math.sqrt(2 * z + 2)
    );
    this.proj.translateFiberBy(this.fiber);
    return this;
}

/**
 * Return the current point as an element (x,y,1,w) of H^2 x R, where
 * - (x,y,1) are th coordinates of a point of H^2 with the Klein model
 * - w is the fiber component
 * @returns {Vector4}
 */
Point.prototype.toKlein = function () {
    let aux = this.toVector4();
    return new Vector4(
        aux.x / aux.z,
        aux.y / aux.z,
        1,
        aux.w
    );
}


Point.prototype.equals = function (point) {
    return this.proj.equals(point.proj) && this.fiber === point.fiber;
}

/**
 * @todo Complete the work so that the fiber match the matrix?
 */
Point.prototype.reduceError = function () {
    this.proj.reduceError();
    return this;
}


Point.prototype.copy = function (point) {
    this.proj.copy(point.proj);
    this.fiber = point.fiber;
    return this;
}

export {
    Point
}

