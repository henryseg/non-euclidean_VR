import {Matrix4, Quaternion} from "../../lib/three.module.js";
import {Isometry} from "./Isometry.js";
import {Point} from "./Point.js";

/**
 * @class
 *
 * @classdesc
 * Location and facing (of the observer, an object, etc).
 *
 * @todo Choose a better name ??
 */
class Position {

    /**
     * Constructor.
     * Return the position corresponding to the origin with the reference frame.
     */
    constructor() {
        /**
         * The isometry component  of the position.
         * @type {Isometry}
         */
        this.boost = new Isometry();
        /**
         * The facing.
         * We represent it as quaternion, whose action by conjugation on R^3 defines an element of O(3)
         */
        this.quaternion = new Quaternion();
    }

    /**
     * The facing as a Matrix4, representing an element of O(3).
     * This is the data that is actually passed to the shader
     * @type {Matrix4}
     */
    get facing() {
        return new Matrix4().makeRotationFromQuaternion(this.quaternion);
    }

    /**
     * Set the boost part of the position.
     * @param {Isometry} isom
     * @return {Position} The current position
     */
    setBoost(isom) {
        this.boost = isom;
        return this;
    }

    /**
     * Set the facing part of the position.
     * @param {Quaternion} quaternion
     * @return {Position} The current position
     */
    setQuaternion(quaternion) {
        this.quaternion = quaternion;
        return this;
    }

    /**
     * Reduce the eventual numerical error of the current boost.
     * @return {Position} The current position
     */
    reduceErrorBoost() {
        this.boost.reduceError();
        return this;
    }

    /**
     * Make the the quaternion has length one.
     * @return {Position} The current position
     */
    reduceErrorQuaternion() {
        this.quaternion.normalize();
        return this;
    }

    /**
     * Reduce the error of the boost part and the quaternion part.
     * @return {Position} The current position
     */
    reduceError() {
        this.reduceErrorBoost();
        this.reduceErrorQuaternion();
        return this;
    }

    /**
     * Return the underlying point
     * @return {Point} the translate of the origin by the isometry part of the position
     */
    get point() {
        return new Point().applyIsometry(this.boost);
    }

    /**
     * Translate the current position by `isom` (left action of the isometry group G on the set of positions).
     * @param {Isometry} isom - the isometry to apply
     * @return {Position} The current position
     */
    applyIsometry(isom) {
        this.boost.premultiply(isom);
        return this;
    }

    /**
     * Rotate the facing by `m` (right action of O(3) in the set of positions).
     * @param {Quaternion} quaternion - the facing to apply (in the observer frame)
     * @return {Position} The current position
     */
    applyQuaternion(quaternion) {
        this.quaternion.multiply(quaternion);
        return this;
    }

    /**
     * Multiply the current position (g0,m0) on the right by the given position (g,m), i.e. return (g0 * g, m * m0)
     * @param {Position} position
     * @return {Position} The current position
     */
    multiply(position) {
        this.boost.multiply(position.boost);
        this.quaternion.premultiply(position.quaternion);
        return this;
    }

    /**
     * Multiply the current position (g0,m0) on the left by the given position (g,m), i.e. return (g * g0, m0 * m)
     * @param {Position} position
     * @return {Position} The current position
     */
    premultiply(position) {
        this.boost.premultiply(position.boost);
        this.quaternion.multiply(position.quaternion);
        return this;
    }

    /**
     * Set the current position with the inverse of the given position
     * @deprecated Not sure this is really needed
     * @param {Position} position
     * @return {Position} The current position
     */
    getInverse(position) {
        this.boost.getInverse(position.boost);
        this.quaternion.copy(position.quaternion);
        this.quaternion.conjugate();
        return this;
    }

    /**
     * Replace the current position, by the one obtained by flow the initial position `(id, id)`
     * in the direction `v` (given in the reference frame).
     * @abstract
     * @param {Vector} v - the direction in the reference frame
     * @return {Position} The current position
     */
    flowFromOrigin(v) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Flow the current position.
     * `v` is the pull back at the origin by the position of the direction in which we flow
     * The time by which we flow is the norm of `v`.
     *
     * The procedure goes as follows.
     * Let `e = (e1, e2, e3)` be the reference frame in the tangent space at the origin.
     * Assume that the current position is `(g,m)`
     * The vector `v = (v1, v2, v3)` is given in the observer frame, that is `v = d_og m u`,
     * where `u = u1 . e1 + u2 . e2 + u3 . e3`.
     * - We first pull back the data at the origin by the inverse of `g`.
     * - We compute the position `(g',m')` obtained from the initial position `(id, id)` by flowing in the direction `w = m u`.
     * This position send the frame `m e` to `d_o g' . m ' . m . e `
     * - We move everything back using `g`, so that the new observer frame is `d_o (gg') . m' . m e`.
     *
     * Hence the new position `(gg', m'm)` is obtained by multiplying `(g,m)` and `(g',m')`
     *
     * @param {Vector} v - the direction in the observer frame
     * @return {Position} The current position
     */
    flow(v) {
        const w = v.clone().applyFacing(this);
        const shift = new Position().flowFromOrigin(w);
        this.multiply(shift);
        return this;
    }

    /**
     * Check if the current position and `position ` are the same.
     * @param {Position} position
     * @return {boolean} true if the positions are equal, false otherwise
     */
    equals(position) {
        return this.boost.equals(position.boost) && this.quaternion.equals(position.quaternion);
    }

    /**
     * Return a new copy of the current position.
     * @return {Position} The clone of the current position
     */
    clone() {
        let res = new Position();
        res.boost.copy(this.boost);
        res.quaternion.copy(this.quaternion);
        return res;
    }

    /**
     * Set the current position with the given one.
     * @param {Position} position - the position to copy
     * @return {Position} the current position
     */
    copy(position) {
        this.boost.copy(position.boost);
        this.quaternion.copy(position.quaternion);
    }

    /**
     * Return a line of GLSL code creating the same position.
     * Used when dynamically building shaders.
     * @return {string} the equivalent GLSL code
     */
    toGLSL() {
        return `Position(
            ${this.boost.toGLSL()},
            ${this.facing.toGLSL()}
        )`;
    }
}

export {
    Position
}