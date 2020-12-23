import {Isometry} from "./Isometry.js";
import {Position} from "./Position.js";


/**
 * @class
 *
 * @classdesc
 * Relative position.
 * A general position is represented as a pair (h,p) where
 * - h (cellBoost) is an Isometry representing an element of a discrete subgroups
 * - p (local) is a Position
 * The frame represented by the relative position is the image by h of the frame represented by the position p
 *
 * We split the isometry part (hg) in two pieces.
 * The idea is to g should gives a position in the fundamental domain of the (implicit) underlying lattice.
 * This will keep the coordinates of g in a bounded range.
 *
 * For simplicity we also keep track of the inverse of the cellBoost.
 *
 * @todo Allow a more combinatorial way to represent discrete subgroups, to avoid numerical error in the cellBoost.
 */
class RelPosition {

    /**
     * Constructor.
     * Return the position corresponding to the origin with the reference frame.
     *
     * @param {Subgroup} sbgp - the underlying discrete subgroups.
     */
    constructor(sbgp) {
        /**
         * the local position
         * @type {Position}
         */
        this.local = new Position();
        /**
         * the "discrete" component of the isometry par of the boost
         * @type {Isometry}
         */
        this.cellBoost = new Isometry();
        /**
         * the inverse of cellBoost
         * @type {Isometry}
         */
        this.invCellBoost = new Isometry();
        /**
         * the isometry component of the position inside the fundamental domain
         * @type {Subgroup}
         */
        this.sbgp = sbgp;
    }

    /**
     * Reduce the eventual numerical error of the current boost.
     * @return {RelPosition} the current relative position
     */
    reduceErrorBoost() {
        this.local.reduceErrorBoost();
        return this;
    }

    /**
     * Reduce the eventual numerical error of the current facing.
     * @return {RelPosition} the current relative position
     * @todo To be completed
     */
    reduceErrorFacing() {
        this.local.reduceErrorFacing();
        return this;
    }

    /**
     * Reduce the eventual numerical error of the current facing.
     * @return {RelPosition} the current relative position
     * @todo To be completed
     */
    reduceErrorLocal() {
        this.local.reduceError();
        return this;
    }

    /**
     * Reduce the eventual numerical error of the current boost.
     * @return {RelPosition} the current relative position
     */
    reduceErrorCellBoost() {
        this.cellBoost.reduceError();
        this.invCellBoost.reduceError();
        return this;
    }

    /**
     * Reduce the eventual numerical error of the current position.
     * @return {RelPosition} the current relative position
     */
    reduceError() {
        this.reduceErrorLocal();
        this.reduceErrorCellBoost();
        return this;
    }


    /**
     * The underlying local point (i.e. ignoring the cell boost)
     * @type {Point}
     */
    get localPoint() {
        return this.local.point;
    }

    /**
     * The underlying point (taking into account the cell boost)
     * @type {Point}
     */
    get point() {
        return this.local.point.applyIsometry(this.cellBoost);
    }

    /**
     * Rotate the facing by `m` (right action of O(3) in the set of positions).
     * @param {Quaternion} quaternion - An isometry of the tangent space at the origin, i.e. a matrix in O(3).
     * @return {RelPosition} the updated version of the current Position
     */
    applyQuaternion(quaternion) {
        this.local.applyQuaternion(quaternion);
        return this;
    }

    /**
     * Apply if needed a teleportation to bring back the local boos in the fundamental domain
     * @return {RelPosition} the current relative position
     */
    teleport() {
        let inside;
        let localPoint;
        while (true) {
            // compute the location of the local part of the position
            localPoint = this.localPoint;
            inside = true;
            for (const teleport of this.sbgp.teleports) {
                inside = inside && !teleport.jsTest(localPoint);
                // if we failed the test, a teleportation is needed.
                // we perform the teleportation and exit the loop
                // (to restart the checks from the beginning).
                if (!inside) {
                    this.local.applyIsometry(teleport.isom);
                    this.cellBoost.multiply(teleport.inv);
                    this.invCellBoost.premultiply(teleport.isom);
                    break;
                }
            }
            if (inside) {
                break;
            }
        }
        return this;
    }

    /**
     * Flow the current position.
     * `v` is the pull back at the origin by the position of the direction in which we flow
     * The time by which we flow is the norm of `v`
     * This method makes sure that the boost stays in the fundamental domain
     * @param {Vector} v - the direction (and length) to follow
     * @return {RelPosition} the current relative position
     */
    flow(v) {
        this.local.flow(v);
        this.teleport();
        return this;
    }

    /**
     * Return the two positions corresponding to the left and right eye.
     * @param {Matrix4} cameraMatrix - a matrix representing the orientation of the camera.
     * @param {number} ipDist - the interpupillary distance
     * @param {string} stereoMode - a mode (defining a correction at the facing level)
     * @return {RelPosition[]} - the position of the left and right eye
     */
    eyes(cameraMatrix, ipDist, stereoMode = undefined) {
        const locals = this.local.eyes(cameraMatrix, ipDist, stereoMode);

        const leftEye = new RelPosition(this.sbgp);
        leftEye.local.copy(locals[0]);
        leftEye.cellBoost.copy(this.cellBoost);
        leftEye.invCellBoost.copy(this.invCellBoost)

        const rightEye = new RelPosition(this.sbgp);
        rightEye.local.copy(locals[1]);
        rightEye.cellBoost.copy(this.cellBoost);
        rightEye.invCellBoost.copy(this.invCellBoost);

        return [leftEye, rightEye];
    }

    /**
     * Check if the current position and `position ` are the same.
     * Mainly for debugging purposes
     * @param {RelPosition} position
     * @return {boolean} true if the relative positions are the same, false otherwise
     */
    equals(position) {
        let res = true;
        res = res && this.local.equals(position.local);
        res = res && this.cellBoost.equals(position.cellBoost);
        return res;
    }

    /**
     * Return a new copy of the current position.
     * @return {RelPosition} the clone of the current relative position
     */
    clone() {
        let res = new RelPosition(this.sbgp);
        res.cellBoost.copy(this.cellBoost);
        res.invCellBoost.copy(this.invCellBoost);
        res.local.copy(this.local);
        return res;
    }

    /**
     * Set the current position with the given position.
     * @param {RelPosition} position - the relative position to copy
     * @return {RelPosition} the current relative position
     */
    copy(position) {
        this.cellBoost.copy(position.cellBoost);
        this.invCellBoost.copy(position.invCellBoost);
        this.local.copy(position.local);
    }

    /**
     * Return a line of GLSL code creating the same position.
     * Used when dynamically building shaders.
     * @return {string} the equivalent GLSL code
     */
    toGLSL() {
        return `RelPosition(
            ${this.local.toGLSL()},
            ${this.cellBoost.toGLSL()},
            ${this.invCellBoost.toGLSL()}
        )`;
    }
}

export {
    RelPosition
};