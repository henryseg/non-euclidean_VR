import {Isometry} from "../abstract/Isometry.js";
import {Matrix4} from "../../lib/three.module.js";

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.build = function () {
    this.matrix = new Matrix4();
}

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.set = function (data) {
    this.matrix = data[0].clone();
    return this;
};

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.reduceError = function () {
    return this;
};

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.multiply = function (isom) {
    this.matrix.multiply(isom.matrix);
    return this;
};

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.premultiply = function (isom) {
    this.matrix.premultiply(isom.matrix);
    return this;
};

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.getInverse = function (isom) {
    this.matrix.getInverse(isom.matrix);
    return this;
};

/**
 * Euclidean implementation of the abstract method
 */
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

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.makeInvTranslation = function (point) {
    [x, y, z,] = point.coords;
    this.matrix.set(
        1, 0, 0, -x,
        0, 1, 0, -y,
        0, 0, 1, -z,
        0, 0, 0, 1,
    )
    return this;
};


/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.equals = function (isom) {
    return this.matrix.equals(this.isom);
};

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.clone = function () {
    let res = new Isometry();
    res.set([this.matrix.clone()]);
    return res;
};

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.copy = function (isom) {
    this.matrix.copy(isom.matrix);
    return this;
};

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.toGLSL = function () {
    return `Isometry(${this.matrix.toGLSL()})`;
}

export {
    Isometry
}