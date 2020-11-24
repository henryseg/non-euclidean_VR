/**
 * @module Abstract geometry
 *
 * @description
 * Defines the objects required by each geometry.
 * Handle the geometry independent part of those objects.
 * The geometry dependent part is done in specific module.
 *
 * For each geometry one needs to choose:
 * - an origin
 * - a reference frame in the tangent space at the origin
 * (see paper)
 */

import {
    Vector3,
    Vector4,
    Matrix4
} from "../lib/three.module.js"

/**
 * @const {string}
 * @default computer name for the geometry
 */
const key = 'abstract';

/**
 * @const {string}
 * @default Full name of the geometry
 */
const name = 'Abstract geometry';

/**
 * @const {string}
 * @default Path to the geometry dependent part of the shader
 * @todo The path is relative to the file 'thurston.js'. Look at good practices for handling paths
 */
const shader = 'geometry/model.glsl';


Number.prototype.toGLSL = function () {
    let res = this.toString();
    if (Number.isInteger(this)) {
        res = res + '.';
    }
    return res;
};

Vector3.prototype.toGLSL = function () {
    return `vec3(${this.toArray()})`;
}

Vector4.prototype.toGLSL = function () {
    return `vec4(${this.toArray()})`;
}

Matrix4.prototype.toGLSL = function () {
    return `mat4(${this.toArray()})`;
};


/**
 * @class
 *
 * @classdesc
 * Isometry of the geometry.
 */
class Isometry {


    /**
     * Constructor.
     * Return the identity.
     * Since the constructor is different for each geometry,
     * the constructor delegate the task to the method build
     * (that can be overwritten easily unlike the constructor)
     * Another way to do would be to implement for each geometry a new class
     * that inherit from Isometry.
     * How ever the draw back is that the class Position would need also to be extended,
     * so that it manipulate the right classes.
     */
    constructor() {
        this.build();
    }

    /**
     * Fake constructor
     * @abstract
     */
    build() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Set the current isometry with the given data.
     * @abstract
     * @param {array} data - the input data (depends on the geometry)
     * @return {Isometry}
     */
    set(data) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Reduce the eventual numerical errors of the current isometry
     * (typically Gram-Schmidt).
     * @abstract
     * @return {Isometry}
     */
    reduceError() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Multiply the current isometry by isom on the left, i.e. replace `this` by `this * isom`.
     * @abstract
     * @param {Isometry} isom
     * @return {Isometry}
     */
    multiply(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Multiply the current isometry by isom on the right, i.e. replace `this` by `isom * this`.
     * @abstract
     * @param {Isometry} isom
     * @return {Isometry}
     */
    premultiply(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Set the current isometry to the inverse of `isom`.
     * @abstract
     * @param {Isometry} isom
     * @return {Isometry}
     */
    getInverse(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return a preferred isometry sending the origin to the given point
     * (typically in Nil, Sol, SL2, etc).
     * @abstract
     * @param {Point} point
     * @return {Isometry}
     */
    makeTranslation(point) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return a preferred isometry sending the given point to the origin
     * (typically in Nil, Sol, SL2, etc).
     * @abstract
     * @param {Point} point
     * @return {Isometry}
     */
    makeInvTranslation(point) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Check if the current isometry and `isom` are the same.
     * @abstract
     * @param isom
     * @return {boolean}
     */
    equals(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return a new copy of the current isometry.
     * @abstract
     * @return {Isometry}
     */
    clone() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Set the current isometry with the given isometry
     * @abstract
     * @param {Isometry} isom
     * @return {Isometry}
     */
    copy(isom) {
        throw new Error("This method need be overloaded.");
    }


    /**
     * Return a line of GLSL code creating the same isometry
     * Used when dynamically building shaders.
     * @abstract
     * @return {string}
     */
    toGLSL() {
        throw new Error("This method need be overloaded.");
    }


}

/**
 * @class
 *
 * @classdesc
 * Point in the geometry.
 */
class Point {

    /**
     * Constructor.
     * Return the origin of the space.
     * Same remark as for isometries.
     */
    constructor() {
        this.build()
    }

    /**
     * Fake constructor
     * @abstract
     */
    build() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Update the current point with the given data.
     * @abstract
     * @param {array} data
     * @return {Point}
     */
    set(data) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Translate the current point by the given isometry.
     * @abstract
     * @param {Isometry} isom
     * @return {Point}
     */
    applyIsometry(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Check if the current point and `point ` are the same.
     * @abstract
     * @param {Point} point
     * @return {boolean}
     */
    equals(point) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return a new copy of the current point.
     * @abstract
     * @return {Point}
     */
    clone() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * set the current point with the given point
     * @abstract
     * @param {Point} point
     * @return {Point}
     */
    copy(point) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return a line of GLSL code creating the same point
     * Used when dynamically building shaders.
     * @abstract
     * @return {string}
     */
    toGLSL() {
        throw new Error("This method need be overloaded.");
    }
}

/**
 * @class
 * @extends Vector3
 *
 * @classdesc
 * Tangent vector at the origin written in the reference frame.
 * Are available form three.js:
 * - all the linear algebra
 * - the length of a vector
 *
 * @todo It seems that this class is actually geometry independent
 * (because of the choice of a reference frame).
 * If so, remove for the other files the class extensions,
 * and replace them by an `export {Vector} from './abstract.js'`
 */
class Vector extends Vector3 {

    /**
     * Rotate the current vector by the facing component of the position.
     * This method is geometry independent as the coordinates of the vector
     * are given in a chosen reference frame.
     * Only the reference frame depends on the geometry.
     * @param {Position} position
     * @return {Vector}
     */
    applyFacing(position) {
        let aux = new Vector4(this.x, this.y, this.z, 0);
        aux.applyMatrix4(position.facing);
        this.set(aux.x, aux.y, aux.z);
        return this;
    }
}

/**
 * @class
 *
 * @classdesc
 * Location and facing (of the observer, an object, etc).
 *
 * Note that the set of position is a group with the following law: (g1, m1) * (g2, m2) = (g1 * g2, m2 * m1)
 */
class Position {

    /**
     * Constructor.
     * Return the position corresponding to the origin with the reference frame.
     *
     * @property {Isometry} boost - the isometry component  of the position
     * @property {Matrix4} facing - the O(3) component of the position (stored as a `Matrix4`)
     */
    constructor() {
        this.boost = new Isometry();
        this.facing = new Matrix4();
    }

    /**
     * Set the boost part of the position.
     * @param {Isometry} isom
     * @return {Position}
     */
    setBoost(isom) {
        this.boost = isom;
        return this;
    }

    /**
     * Set the facing part of the position.
     * @param {Matrix4} facing
     * @return {Position}
     */
    setFacing(facing) {
        this.facing = facing;
        return this;
    }

    /**
     * Reduce the eventual numerical error of the current boost.
     * @return {Position}
     */
    reduceErrorBoost() {
        this.boost.reduceError();
        return this;
    }

    /**
     * Reduce the eventual numerical error of the current facing.
     * @return {Position}
     * @todo To be completed
     */
    reduceErrorFacing() {
        return this;
    }

    /**
     * Reduce the eventual numerical error of the current position.
     * @return {Position}
     */
    reduceError() {
        this.reduceErrorBoost();
        this.reduceErrorFacing();
        return this;
    }

    /**
     * Translate the current position by `isom` (left action of the isometry group G on the set of positions).
     * @param {Isometry} isom
     * @return {Position}
     */
    applyIsometry(isom) {
        this.boost.premultiply(isom);
        return this;
    }

    /**
     * Rotate the facing by `m` (right action of O(3) in the set of positions).
     * @param {Matrix4} matrix
     * @return {Position}
     */
    applyFacing(matrix) {
        this.facing.multiply(matrix)
        return this;
    }

    /**
     * Multiply the current position (g0,m0) on the right by the given position (g,m), i.e. return (g0 * g, m * m0)
     * @param {Position} position
     */
    multiply(position) {
        this.boost.multiply(position.boost);
        this.facing.premultiply(position.facing);
        return this;
    }

    /**
     * Multiply the current position (g0,m0) on the left by the given position (g,m), i.e. return (g * g0, m0 * m)
     * @param {Position} position
     */
    premultiply(position) {
        this.boost.premultiply(position.boost);
        this.facing.multiply(position.facing);
        return this;
    }

    /**
     * Set the current position with the inverse of the given position
     * @param {Position} position
     */
    getInverse(position) {
        this.boost.getInverse(position.boost);
        this.facing.getInverse(position.facing);
        return this;
    }

    /**
     * Flow the current position.
     * `v` is the pull back at the origin by the position of the direction in which we flow
     * The time by which we flow is the norm of `v`
     * @abstract
     * @param {Vector} v
     * @return {Position}
     */
    flow(v) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return the vector pointing forwards (taking into account the facing).
     * @return {Vector}
     */
    getFwdVector() {
        let aux = new Vector(0, 0, -1);
        return aux.applyFacing(this);
    }

    /**
     * Return the vector pointing to the right (taking into account the facing).
     * @return {Vector}
     */
    getRightVector() {
        let aux = new Vector(1, 0, 0);
        return aux.applyFacing(this);
    }

    /**
     * return the vector pointing upwards (taking into account the facing)
     * @return {Vector}
     */
    getUpVector() {
        let aux = new Vector(0, 1, 0);
        return aux.applyFacing(this);
    }

    /**
     * Check if the current position and `position ` are the same.
     * @param {Position} position
     * @return {boolean}
     */
    equals(position) {
        return this.boost.equals(position.boost) && this.facing.equals(position.facing);
    }

    /**
     * Return a new copy of the current position.
     * @return {Position}
     */
    clone() {
        let res = new Position()
        res.setBoost(this.boost.clone());
        res.setFacing(this.facing.clone());
        return res;
    }

    /**
     * Set the current position with the given position.
     * @param {Position} position
     * @return {Position}
     */
    copy(position) {
        this.boost.copy(position.boost);
        this.facing.copy(position.facing);
    }
}

export {
    key,
    name,
    shader,
    Isometry,
    Point,
    Vector,
    Position
}
