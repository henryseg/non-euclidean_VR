/**
 * @module Euclidean geometry
 *
 * @description
 * Extension of the abstract geometry modeule for the euclidean space.
 * Overload all the geometry dependend method in the Abstract geometry module.
 */

import {
    Matrix4,
    Vector4,
} from "../lib/three.module.js"

import {
    Isometry,
    Point,
    Position
} from "./abstract.js"

/**
 * @const {string}
 * @default computer name for the geometry
 */
const key = 'euc';

/**
 * @const {string}
 * @default Full name of the geometry
 */
const name = 'Euclidean space';

/**
 * @const {string}
 * @default Path to the geometry dependent part of the shader
 * @todo The path is relative to the file 'thurston.js'. Look at good practices for handling paths
 */
const shader = 'shaders/geometry/euc.glsl';


/**
 * Fake constructor
 */
Isometry.prototype.build = function () {
    this.matrix = new Matrix4();
}

/**
 * Set the current isometry with the given data.
 * @param {array} data - the first entry of data
 * should be the matrix representing the isometry
 * @return {Isometry}
 */
Isometry.prototype.set = function (data) {
    this.matrix = data[0].clone();
    return this;
};

/**
 * Reduce the eventual numerical errors of the current isometry
 * (typically Gram-Schmidt).
 * @return {Isometry}
 */
Isometry.prototype.reduceError = function () {
    return this;
};

/**
 * Multiply the current isometry by isom on the left, i.e. replace `this` by `this * isom`.
 * @param {Isometry} isom
 * @return {Isometry}
 */
Isometry.prototype.multiply = function (isom) {
    this.matrix.multiply(isom.matrix);
    return this;
};

/**
 * Multiply the current isometry by isom on the right, i.e. replace `this` by `isom * this`.
 * @param {Isometry} isom
 * @return {Isometry}
 */
Isometry.prototype.premultiply = function (isom) {
    this.matrix.premultiply(isom.matrix);
    return this;
};

/**
 * Set the current isometry to the inverse of `isom`.
 * @param {Isometry} isom
 * @return {Isometry}
 */
Isometry.prototype.getInverse = function (isom) {
    this.matrix.getInverse(isom.matrix);
    return this;
};

/**
 * Return a preferred isometry sending the origin to the given point
 * (typically in Nil, Sol, SL2, etc).
 * @param {Point} point
 * @return {Isometry}
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
 * Return a preferred isometry sending the given point to the origin
 * (typically in Nil, Sol, SL2, etc).
 * @param {Point} point
 * @return {Isometry}
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
 * Check if the current isometry and `isom` are the same.
 * @param isom
 * @return {boolean}
 */
Isometry.prototype.equals = function (isom) {
    return this.matrix.equals(this.isom);
};

/**
 * Return a new copy of the current isometry.
 * @return {Isometry}
 */
Isometry.prototype.clone = function () {
    let res = new Isometry();
    res.set([this.matrix.clone()]);
    return res;
};

/**
 * Set the current isometry with the given isometry
 * @param {Isometry} isom
 * @return {Isometry}
 */
Isometry.prototype.copy = function (isom) {
    this.matrix.copy(isom.matrix);
    return this;
};

/**
 * Return a line of GLSL code creating the same isometry
 * Used when dynamically building shaders.
 * @return {string}
 */
Isometry.prototype.toGLSL = function () {
    return `Isometry(${this.matrix.toGLSL()})`;
}


/**
 * Constructor.
 * Return the origin of the space.
 */
Point.prototype.build = function () {
    this.coords = new Vector4(0, 0, 0, 1);
};

/**
 * Update the current point with the given data.
 * @param {array} data - the first entry of data
 * are the coordinates of the point as a `Vector4`
 * @return {Point}
 */
Point.prototype.set = function (data) {
    this.coords = data[0].clone();
    return this;
};

/**
 * Translate the current point by the given isometry.
 * @param {Isometry} isom
 * @return {Point}
 */
Point.prototype.applyIsometry = function (isom) {
    this.coords.applyMatrix4(isom.matrix)
    return this;
};


/**
 * Check if the current point and `point ` are the same.
 * @param {Point} point
 * @return {boolean}
 */
Point.prototype.equals = function (point) {
    return this.coords.equals(point.coords)
};

/**
 * Return a new copy of the current point.
 * @return {Point}
 */
Point.prototype.clone = function () {
    let res = new Point()
    res.set([this.coords.clone()]);
    return res;
};

/**
 * set the current point with the given point
 * @param {Point} point
 * @return {Point}
 */
Point.prototype.copy = function (point) {
    this.coords.copy(point.coords);
    return this;
};

/**
 * Return a line of GLSL code creating the same point
 * Used when dynamically building shaders.
 * @return {string}
 */
Point.prototype.toGLSL = function () {
    return `Point(${this.coords.toGLSL()})`;
}

/**
 * Flow the current position.
 * `v` is the pull back at the origin by the position of the direction in which we flow
 * The time by which we flow is the norm of `v`
 * @param {Vector} v
 * @return {Position}
 */
Position.prototype.flow = function (v) {
    const dir = v.clone().applyFacing(this);
    const point = new Point().set([new Vector4(dir.x, dir.y, dir.z, 1)]);
    this.boost.multiply(new Isometry().makeTranslation(point));
    return this;
}

export {
    key,
    name,
    shader,
    Isometry,
    Point,
    Position
}

export {
    Vector,
} from './abstract.js'
