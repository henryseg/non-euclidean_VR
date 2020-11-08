/**
 * @module abstract
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
    Matrix4
} from "../lib/three.min.js"


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
     */
    constructor() {
    }

    /**
     * Set the current isometry with the given data.
     * @param {array} data - the input data (depends on the geometry)
     * @return {Isometry}
     */
    set(data) {
    }

    /**
     * Reduce the eventual numerical errors of the current isometry
     * (typically Gram-Schmidt).
     * @return {Isometry}
     */
    reduceError() {
    }

    /**
     * Multiply the current isometry by isom on the left, i.e. replace `this` by `this * isom`.
     * @param {Isometry} isom
     * @return {Isometry}
     */
    multiply(isom) {
    }

    /**
     * Multiply the current isometry by isom on the right, i.e. replace `this` by `isom * this`.
     * @param {Isometry} isom
     * @return {Isometry}
     */
    premultiply(isom) {
    }

    /**
     * Set the current isometry to the inverse of `isom`.
     * @param {Isometry} isom
     * @return {Isometry}
     */
    inverse(isom) {
    }

    /**
     * Check if the current isometry and `isom` are the same.
     * @param isom
     * @return {boolean}
     */
    equals(isom) {
    }

    /**
     * Return a new copy of the current isometry.
     * @return {Isometry}
     */
    clone() {
    }

    /**
     * Set the current isometry with the given isometry
     * @param {Isometry} isom
     * @return {Isometry}
     */
    copy(isom) {
    }

    /**
     * Encode the isometry in a way that can be easily passed to the shader.
     * @todo Decide what type is used to pass a position to the shader
     */
    serialize() {
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
     */
    constructor() {
    }

    /**
     * Update the current point with the given data.
     * @param {array} data
     * @return {Point}
     */
    set(data) {
    }

    /**
     * Translate the current point by the given isometry.
     * @param {Isometry} isom
     * @return {Point}
     */
    translateBy(isom) {
    }

    /**
     * Return a preferred isometry sending the origin to the current point (typically in Nil, Sol, SL2, etc).
     * @return {Isometry}
     */
    makeTranslation() {
    }

    /**
     * Return a preferred isometry sending the current point to the origin (typically in Nil, Sol, SL2, etc).
     * @return {Isometry}
     */
    makeInvTranslation() {
    }

    /**
     * Check if the current point and `point ` are the same.
     * @param {Point} point
     * @return {boolean}
     */
    equals(point) {
    }

    /**
     * Return a new copy of the current point.
     * @return {Point}
     */
    clone() {
    }

    /**
     * set the current point with the given point
     * @param {Point} point
     * @return {Point}
     */
    copy(point) {
    }

    /**
     * Encode the point in a way that can be easily passed to the shader.
     * @todo Decide what type is used to pass a position to the shader
     */
    serialize() {
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
 */
class Vector extends Vector3 {

    /**
     * Rotate the current vector by the facing component of the position.
     * @param {Position} position
     * @return {Vector}
     */
    rotateByFacing(position) {
    }

    /**
     * Encode the vector in a way that can be easily passed to the shader.
     * @todo Decide what type is used to pass a position to the shader
     */
    serialize() {
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
     *
     */
    constructor() {
    }

    /**
     * Set the boost part of the position.
     * @param {Isometry} isom
     * @return {Position}
     */
    setBoost(isom) {
    }

    /**
     * Set the facing part of the position.
     * @param {Matrix4} facing
     * @return {Position}
     */
    setFacing(facing) {
    }

    /**
     * Reduce the eventual numerical error of the current boost.
     * @return {Position}
     */
    reduceErrorBoost() {
    }

    /**
     * Reduce the eventual numerical error of the current facing.
     * @return {Position}
     */
    reduceErrorFacing() {
    }

    /**
     * Reduce the eventual numerical error of the current position.
     * @return {Position}
     */
    reduceError() {
    }

    /**
     * Translate the current position by `isom` (left action of the isometry group G on the set of positions).
     * @param {Isometry} isom
     * @return {Position}
     */
    translateBy(isom) {
    }

    /**
     * Rotate the facing by `m` (right action of O(3) in the set of positions).
     * @param {Matrix4} m
     * @return {Position}
     */
    rotateBy(m) {
    }

    /**
     * Multiply the current position (g0,m0) on the right by the given position (g,m), i.e. return (g0 * g, m * m0)
     * @param {Position} position
     */
    multiply(position) {
    }

    /**
     * Multiply the current position (g0,m0) on the left by the given position (g,m), i.e. return (g * g0, m0 * m)
     * @param {Position} position
     */
    premultiply(position) {
    }

    /**
     * Set the current position with the inverse of the given position
     * @param {Position} position
     */
    getInverse(position) {
    }

    /**
     * Flow the current position in the direction `v`.
     * The facing is updated using parallel transport.
     * The time by which we flow is the norm of `v`
     * @param {Vector} v
     * @return {Position}
     */
    flow(v) {
    }

    /**
     * Return the vector pointing forwards (taking into account the facing).
     * @return {Vector}
     */
    getFwdVector() {
    }

    /**
     * Return the vector pointing to the right (taking into account the facing).
     * @return {Vector}
     */
    getRightVector() {
    }

    /**
     * return the vector pointing upwards (taking into account the facing)
     * @return {Vector}
     */
    getUpVector() {
    }

    /**
     * Check if the current position and `position ` are the same.
     * @param {Position} position
     * @return {boolean}
     */
    equals(position) {
    }

    /**
     * Return a new copy of the current position.
     * @return {Position}
     */
    clone() {
    }

    /**
     * Set the current position with the given position.
     * @param {Position} position
     * @return {Position}
     */
    copy(position) {
    }

    /**
     * Encode the position in a way that can be easily passed to the shader.
     * @todo Decide what type is used to pass a position to the shader
     */
    serialize() {
    }


}

export {
    Isometry,
    Point,
    Vector,
    Position
}