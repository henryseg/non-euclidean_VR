import {Vector4} from "../../../lib/three.module.js";

/**
 * Lorentzian inner product in R^4
 * @param {Vector4} v
 * @return {number}
 */
Vector4.prototype.hypDot = function (v) {
    return this.x * v.x + this.y * v.y + this.z * v.z - this.w * v.w;
}

/**
 * Lorentzian length squared in R^4
 * @return {number}
 */
Vector4.prototype.hypLengthSq = function () {
    return Math.abs(this.hypDot(this));
}

/**
 * Lorentzian length in R^4
 * @return {number}
 */
Vector4.prototype.hypLength = function () {
    return Math.sqrt(this.hypLengthSq());
}

/**
 * Normalize the vector for the Lorentzian length
 * @return {Vector4}
 */
Vector4.prototype.hypNormalize = function () {
    this.divideScalar(this.hypLength());
    return this;
}