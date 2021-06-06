import {Matrix4} from "../../../lib/threejs/build/three.module.js";

import {Isometry} from "../../../core/geometry/Isometry.js";

Isometry.prototype.build = function () {
    this.matrix = new Matrix4();
}

Isometry.prototype.identity = function () {
    this.matrix.identity();
    return this;
}

Isometry.prototype.reduceError = function () {
    return this;
};

Isometry.prototype.multiply = function (isom) {
    this.matrix.multiply(isom.matrix);
    return this;
};

Isometry.prototype.premultiply = function (isom) {
    this.matrix.premultiply(isom.matrix);
    return this;
};

Isometry.prototype.invert = function () {
    this.matrix.invert();
    return this;
};

Isometry.prototype.makeTranslation = function (point) {
    const [x, y, z,] = point.coords.toArray();
    this.matrix.set(
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1,
    )
    return this;
};

Isometry.prototype.makeInvTranslation = function (point) {
    const [x, y, z,] = point.coords.toArray();
    this.matrix.set(
        1, 0, 0, -x,
        0, 1, 0, -y,
        0, 0, 1, -z,
        0, 0, 0, 1,
    )
    return this;
};

Isometry.prototype.makeTranslationFromDir = function (vec) {
    const [x, y, z] = vec.toArray();
    this.matrix.set(
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1,
    )
    return this;
}

/**
 * Set the current isometry with a rotation around the x-axis
 * @param {number} theta - the rotation angle
 */
Isometry.prototype.makeRotationX = function (theta) {
    this.matrix.makeRotationX(theta);
    return this;
}

/**
 * Set the current isometry with a rotation around the y-axis
 * @param {number} theta - the rotation angle
 */
Isometry.prototype.makeRotationY = function (theta) {
    this.matrix.makeRotationY(theta);
    return this;
}

/**
 * Set the current isometry with a rotation around the z-axis
 * @param {number} theta - the rotation angle
 */
Isometry.prototype.makeRotationZ = function (theta) {
    this.matrix.makeRotationZ(theta);
    return this;
}

Isometry.prototype.equals = function (isom) {
    return this.matrix.equals(isom.matrix);
};

Isometry.prototype.clone = function () {
    const res = new Isometry();
    res.matrix.copy(this.matrix);
    return res;
};

Isometry.prototype.copy = function (isom) {
    this.matrix.copy(isom.matrix);
    return this;
};


export {
    Isometry
}