import {Isometry} from "../../../core/geometry/Isometry.js";
import {Matrix4} from "../../../lib/three.module.js";


Isometry.prototype.build = function () {
    /**
     * Matrix of the isometry in the projective model
     * @type {Matrix4}
     */
    this.matrix = new Matrix4();
    /**
     * Boolean flag
     * True, if the isometry belongs to Nil
     * False, means that one cannot decide
     * (e.g. the conjugation of an element in Nil by another element that is not in Nil)
     * @type {boolean}
     */
    this.isInNil = true;
}

Isometry.prototype.identity = function () {
    this.matrix.identity();
    this.isInNil = true;
    return this;
}

Isometry.prototype.reduceError = function () {
    return this;
};

Isometry.prototype.multiply = function (isom) {
    this.matrix.multiply(isom.matrix);
    this.isInNil = this.isInNil && isom.isInNil;
    return this;
};

Isometry.prototype.premultiply = function (isom) {
    this.matrix.premultiply(isom.matrix);
    this.isInNil = this.isInNil && isom.isInNil;
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
        -0.5 * y, 0.5 * x, 1, z,
        0, 0, 0, 1,
    )
    this.isInNil = true;
    return this;
};

Isometry.prototype.makeInvTranslation = function (point) {
    const [x, y, z,] = point.coords.toArray();
    this.matrix.set(
        1, 0, 0, -x,
        0, 1, 0, -y,
        0.5 * y, -0.5 * x, 1, -z,
        0, 0, 0, 1,
    )
    this.isInNil = true;
    return this;
};

Isometry.prototype.makeTranslationFromDir = function (vec) {
    console.warn('Not done yet');
    const [x, y, z] = vec.toArray();
    this.matrix.set(
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1,
    )
    return this;
}

Isometry.prototype.equals = function (isom) {
    return this.matrix.equals(isom.matrix);
};

Isometry.prototype.clone = function () {
    let res = new Isometry();
    res.matrix.copy(this.matrix);
    res.isInNil = this.isInNil;
    return res;
};

Isometry.prototype.copy = function (isom) {
    this.matrix.copy(isom.matrix);
    this.isInNil = isom.isInNil;
    return this;
};

Isometry.prototype.toGLSL = function () {
    return `Isometry(${this.matrix.toGLSL()})`;
}

export {
    Isometry
}