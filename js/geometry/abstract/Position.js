import {Matrix4} from "../../lib/three.module.js";
import {Isometry} from "./Isometry.js";
import {Point} from "./Point.js";

/**
 * @class
 *
 * @classdesc
 * Location and facing (of the observer, an object, etc).
 *
 * @todo Choose a better name ??
 * @todo Replace the facing matrix by a quaternion (to stay closer to Three.js)?
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
         * The O(3) component of the position.
         * @type {Matrix4}
         */
        this.facing = new Matrix4();
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
     * @param {Matrix4} facing
     * @return {Position} The current position
     */
    setFacing(facing) {
        this.facing = facing;
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
     * Reduce the eventual numerical error of the current facing.
     * @return {Position} The current position
     * @todo To be completed
     */
    reduceErrorFacing() {
        return this;
    }

    /**
     * Reduce the eventual numerical error of the current position.
     * @return {Position} The current position
     */
    reduceError() {
        this.reduceErrorBoost();
        this.reduceErrorFacing();
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
     * @param {Matrix4} matrix - the facing to apply (in the observer frame)
     * @return {Position} The current position
     */
    applyFacing(matrix) {
        this.facing.multiply(matrix);
        return this;
    }

    /**
     * Multiply the current position (g0,m0) on the right by the given position (g,m), i.e. return (g0 * g, m * m0)
     * @param {Position} position
     * @return {Position} The current position
     */
    multiply(position) {
        this.boost.multiply(position.boost);
        this.facing.premultiply(position.facing);
        return this;
    }

    /**
     * Multiply the current position (g0,m0) on the left by the given position (g,m), i.e. return (g * g0, m0 * m)
     * @param {Position} position
     * @return {Position} The current position
     */
    premultiply(position) {
        this.boost.premultiply(position.boost);
        this.facing.multiply(position.facing);
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
        this.facing.getInverse(position.facing);
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
        return this.boost.equals(position.boost) && this.facing.equals(position.facing);
    }

    /**
     * Return a new copy of the current position.
     * @return {Position} The clone of the current position
     */
    clone() {
        let res = new Position()
        res.setBoost(this.boost.clone());
        res.setFacing(this.facing.clone());
        return res;
    }

    /**
     * Set the current position with the given one.
     * @param {Position} position - the position to copy
     * @return {Position} the current position
     */
    copy(position) {
        this.boost.copy(position.boost);
        this.facing.copy(position.facing);
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