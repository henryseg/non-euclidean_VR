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
} from '../lib/three.min.js'


/**
 * @class Isometry
 *
 * @description
 * Isometry of the geometry
 */

class Isometry {

    /**
     * Constructor
     * Return the identity
     */
    constructor() {
    }

    /**
     * set the current isometry with the given data
     * @param {array} data - the input data (depends on the geometry)
     * @return {Isometry}
     */
    set(data) {
    }

    /**
     * reduce the eventual numerical errors of the current isometry
     * (typically Gram-Schmidt)
     * @return {Isometry}
     */
    reduceError() {
    }

    /**
     * Multiply the current isometry by isom on the left, i.e. replace `this` by `this * isom`
     * @param {Isometry} isom
     * @return {Isometry}
     */
    multiply(isom) {
    }

    /**
     * Multiply the current isometry by isom on the right, i.e. replace `this` by `isom * this`
     * @param {Isometry} isom
     * @return {Isometry}
     */
    premultiply(isom) {
    }

    /**
     * set the current isometry to the inverse of `isom`
     * @param {Isometry} isom
     * @return {Isometry}
     */
    inverse(isom) {
    }

    /**
     * check if the current isometry and `isom` are the same
     * @param isom
     * @return {boolean}
     */
    equals(isom) {
    }

    /**
     * return a new copy of the current isometry
     * @return {Isometry}
     */
    clone() {
    }

    /**
     * set the current isometry with the data of `isom`
     * @param {Isometry} isom
     * @return {Isometry}
     */
    copy(isom) {
    }

    /**
     * encode the isometry in a way that can be easily passed to the shader
     */
    serialize() {
    }


}

/**
 * @class Point
 *
 * @description
 * Point in the geometry
 */
class Point {

    /**
     * Constructor.
     * Return the origin of the space
     */
    constructor() {
    }

    /**
     * update the current point with the given data
     * @param {array} data
     * @return {Point}
     */
    set(data) {
    }

    /**
     * Translate the current point by the given isometry
     * @param {Isometry} isom
     * @return {Point}
     */
    translateBy(isom) {
    }

    /**
     * Return a preferred isometry sending the origin to the current point (typically in Nil, Sol, SL2, etc)
     * @return {Isometry}
     */
    makeTranslation() {
    }

    /**
     * Return a preferred isometry sending the current point to the origin (typically in Nil, Sol, SL2, etc)
     * @return {Isometry}
     */
    makeTranslationInverse() {
    }

    /**
     * check if the current point and `point ` are the same
     * @param {Point} point
     * @return {boolean}
     */
    equals(point) {
    }

    /**
     * return a new copy of the current point
     * @return {Point}
     */
    clone() {
    }

    /**
     * set the current point with the data of `point`
     * @param {Point} point
     * @return {Point}
     */
    copy(point) {
    }

    /**
     * encode the point in a way that can be easily passed to the shader
     */
    serialize() {
    }
}

/**
 * @class Vector
 *
 * @description
 * Tangent vector at the origin written in the reference frame
 * Are available form three.js
 * - all the linear algebra
 * - the length of a vector
 */
class Vector extends Vector3 {

    /**
     * rotate the current vector by the facing component of the position
     * @param {Position} position
     * @return {Vector}
     */
    rotateByFacing(position) {
    }

    /**
     *  encode the vector in a way that can be easily passed to the shader
     */
    serialize() {
    }
}

/**
 * @class Position
 * @property {Isometry} boost - the isometry component  of the position
 * @property {Matrix4} facing - the O(3) component of the position (stored as a `Matrix4`)
 *
 * @description
 * location and facing (of the observer, an object, etc)
 */
class Position {

    /**
     * Constructor.
     * Return the position corresponding to the origin with the reference frame
     */
    constructor() {
    }

    /**
     * set the boost part of the position
     * @param {Isometry} isom
     * @return {Position}
     */
    setBoost(isom) {
    }

    /**
     * set the facing part of the position
     * @param {Matrix4} facing
     * @return {Position}
     */
    setFacing(facing) {
    }

    /**
     * reduce the eventual numerical error of the current boost
     * @return {Position}
     */
    reduceErrorBoost() {
    }

    /**
     * reduce the eventual numerical error of the current facing
     * @return {Position}
     */
    reduceErrorFacing() {
    }

    /**
     * reduce the eventual numerical error of the current position
     * @return {Position}
     */
    reduceError() {
    }

    /**
     * translate the current position by `isom` (left action of the isometry group G on the set of positions)
     * @param {Isometry} isom
     * @return {Position}
     */
    translateBy(isom) {
    }

    /**
     * rotate the facing by `m`(right action of O(3) in the set of positions)
     * @param {Matrix4} m
     * @return {Position}
     */
    rotateBy(m) {
    }

    /**
     * flow the current position in the direction `v`.
     * The facing is updated using parallel transport.
     * The time by which we flow is the norm of `v`
     * @param {Vector} v
     * @return {Position}
     */
    flow(v) {
    }

    /**
     * return the vector pointing forwards (taking into account the facing)
     * @return {Vector}
     */
    getFwdVector() {
    }

    /**
     * return the vector pointing to the right (taking into account the facing)
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
     * check if the current position and `position ` are the same
     * @param {Position} position
     * @return {boolean}
     */
    equals(position) {
    }

    /**
     * return a new copy of the current position
     * @return {Position}
     */
    clone() {
    }

    /**
     * set the current position with the data of `position `
     * @param {Position} position
     * @return {Position}
     */
    copy(position) {
    }

    /**
     * encode the position in a way that can be easily passed to the shader
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