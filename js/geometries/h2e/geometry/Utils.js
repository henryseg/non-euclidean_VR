import {Vector4} from "../../../lib/threejs/build/three.module.js";

/**
 * Some Lorentzian geometry in R^3
 * We work with Vector4 though, ignoring the last coordinates
 * This is easier as the points in H2 x E are Vector4
 */


/**
 * Lorentzian inner product in R^3
 * @param {Vector4} v
 * @return {number}
 */
Vector4.prototype.hypDot = function (v) {
    return this.x * v.x + this.y * v.y - this.z * v.z;
}

/**
 * Lorentzian length squared in R^3
 * @return {number}
 */
Vector4.prototype.hypLengthSq = function () {
    return Math.abs(this.hypDot(this));
}

/**
 * Lorentzian length in R^3
 * @return {number}
 */
Vector4.prototype.hypLength = function () {
    return Math.sqrt(this.hypLengthSq());
}

/**
 * Normalize the first three coordinates of the vector for the Lorentzian length
 * @return {Vector4}
 */
Vector4.prototype.hypNormalize = function () {
    const [x, y, z, w] = this.toArray();
    const len = this.hypLength();
    this.set(x / len, y / len, z / len, w);
    return this;
}