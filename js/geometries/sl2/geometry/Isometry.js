import {Matrix4, Quaternion} from "../../../lib/threejs/build/three.module.js";

import {Isometry} from "../../../core/geometry/Isometry.js";
import {SL2} from "./Utils.js";
import {Point} from "./Point.js";

/**
 * An Isometry in the universal cover X of SL(2,R) is made of two components :
 * - A matrix, representing the induced isometry of SL(2,R)
 * - A number, corresponding to the fiber component of the image of the origin
 * These two data suffices to completely characterize the isometry.
 * It has the advantage that the is compatible with our representation of point X
 * (projection in SL(2,R) + fiber component).
 */
Isometry.prototype.build = function () {
    this.matrix = new Matrix4();
    this.fiber = 0;
    /**
     * Boolean flag
     * True, if the isometry belongs to (the universal cover of) SL(2,R)
     * False, means that one cannot decide
     * @type {boolean}
     */
    this.isInSL = true;
}

Isometry.prototype.identity = function () {
    this.matrix.identity();
    this.fiber = 0;
    this.isInSL = true;
    return this;
}

Isometry.prototype.reduceError = function () {
    return this;
};

/**
 * The isometry group of X maps onto Z/2, seen as the group flipping the fiber.
 * Returns true is the current isometry flips the fiber and false otherwise.
 * @return {boolean}
 */
Isometry.prototype.doesFlip = function () {
    if (this.isInSL) {
        return false;
    } else {
        const a00 = this.matrix.elements[0];
        const a10 = this.matrix.elements[1];
        const a01 = this.matrix.elements[4];
        const a11 = this.matrix.elements[5];
        return (a00 * a11 - a10 * a01) < 0;
    }
}

/**
 * Replace the current isometry with the product isom1 * isom2
 * @param {Isometry} isom1 - the first isometry
 * @param {Isometry} isom2 - the second isometry
 * @return {Isometry} - the product
 */
Isometry.prototype.multiplyIsometries = function (isom1, isom2) {
    // image of the origin by isom2
    const aux2 = new Point();
    aux2.proj.copy(new SL2().applyMatrix4(isom2.matrix));
    aux2.fiber = isom2.fiber;
    // image of the origin by the product isom1 * isom2
    const aux = aux2.applyIsometry(isom1);
    this.matrix.multiplyMatrices(isom1.matrix, isom2.matrix);
    this.fiber = aux.fiber;
    this.isInSL = isom1.isInSL && isom2.isInSL;
    return this;
}

Isometry.prototype.multiply = function (isom) {
    return this.multiplyIsometries(this, isom);
}

Isometry.prototype.premultiply = function (isom) {
    return this.multiplyIsometries(isom, this);
}

Isometry.prototype.invert = function () {
    this.fiber = this.doesFlip() ? this.fiber : -this.fiber;
    this.matrix.invert();
    return this;
}

Isometry.prototype.makeTranslation = function (point) {
    this.matrix.copy(point.proj.toMatrix4());
    this.fiber = point.fiber;
    this.isInSL = true;
    return this;
}

/**
 * Return the element in (the universal cover of) SL(2,R) sending the origin to the image of t*u by the exponential map
 * @param {Vector} u - a unit tangent vector
 * @param {Number} t - a scale/time parameter
 * @return {Isometry} - the corresponding isometry
 */
Isometry.prototype.makeTranslationFromUnitDir = function (u, t) {
    // cylindrical coordinates of u (without the angle alpha)
    const c = u.z;
    const a = Math.sqrt(1 - c * c);

    const target = new Point();
    const spin = new SL2().set(Math.cos(c * t), Math.sin(c * t), 0, 0);
    let w = 2 * c * t; // the angle in the fiber achieved by the geodesic (before final adjustment)
    let omega;  // the "pulsatance" involved in the geodesic flow.
    let tanPhi;

    const absC = Math.abs(c);
    if (a === absC) {
        // parabolic trajectory
        target.proj.set(
            1,
            -0.25 * Math.sqrt(2) * t,
            0.5 * t,
            0
        );
        tanPhi = -0.25 * Math.sqrt(2) * t;
        target.fiber = w + 2 * Math.atan(tanPhi);
    } else if (a > absC) {
        // hyperbolic trajectory
        omega = Math.sqrt(a * a - c * c);
        target.proj.set(
            Math.cosh(0.5 * omega * t),
            -(c / omega) * Math.sinh(0.5 * omega * t),
            (1 / omega) * Math.sinh(0.5 * omega * t),
            0
        );
        tanPhi = -(c / omega) * Math.tanh(0.5 * omega * t);
        target.fiber = w + 2 * Math.atan(tanPhi);

    } else if (a < absC) {
        // elliptic trajectory
        omega = Math.sqrt(c * c - a * a);
        target.proj.set(
            Math.cos(0.5 * omega * t),
            -(c / omega) * Math.sin(0.5 * omega * t),
            (1 / omega) * Math.sin(0.5 * omega * t),
            0
        );
        tanPhi = -(c / omega) * Math.tan(0.5 * omega * t);
        let n = Math.floor(0.5 * omega * t / Math.PI + 0.5);
        if (c < 0) {
            n = -n;
        }
        target.fiber = w + 2 * Math.atan(tanPhi) - 2 * n * Math.PI;
    }
    target.proj.multiply(spin);
    // note that the coefficient a is missing on the third coordinate in the translation part above.
    // the reason is that it is implicitly in the rotation/scaling matrix below
    const rotation = new Matrix4().set(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, u.x, -u.y,
        0, 0, u.y, u.x
    );
    target.proj.applyMatrix4(rotation);
    this.makeTranslation(target);
    return this;
}

/**
 * Return the element in (the universal cover of) SL(2,R) sending the origin to the image of v by the exponential map
 * @param {Vector} v - the vector
 * @return {Isometry} - the corresponding isometry
 */
Isometry.prototype.makeTranslationFromDir = function (v) {
    // length of v
    const t = v.length();
    // if v is the zero vector, we are just not moving !
    if (t === 0) {
        this.identity();
        return this;
    }
    // normalized version of v
    const u = v.clone().normalize();
    return this.makeTranslationFromUnitDir(u, t);
}

Isometry.prototype.makeInvTranslation = function (point) {
    const aux = point.proj.clone().invert();
    this.matrix.copy(aux.toMatrix4());
    this.fiber = -point.fiber;
    this.isInSL = true;
    return this;
}

Isometry.prototype.equals = function (isom) {
    return this.matrix.equals(isom.matrix) && this.fiber === isom.fiber;
}

Isometry.prototype.clone = function () {
    const res = new Isometry();
    res.matrix.copy(this.matrix);
    res.fiber = this.fiber;
    res.isInSL = this.isInSL;
    return res;
}

Isometry.prototype.copy = function (isom) {
    this.matrix.copy(isom.matrix);
    this.fiber = isom.fiber;
    this.isInSL = isom.isInSL;
    return this;
}

export {
    Isometry
}