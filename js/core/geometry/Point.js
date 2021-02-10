/**
 * @class
 *
 * @classdesc
 * Point in the geometry.
 */
class Point {

    /**
     * Constructor.
     * Same remark as for isometries.
     */
    constructor(...args) {
        this.build(...args);
    }

    /**
     * Fake constructor.
     * If no argument is passed, return the origin of the space.
     * @abstract
     */
    build() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Set the coordinates of the point
     */
    set() {
        throw new Error("This method need be overloaded.");
    }

    get isPoint(){
        return true;
    }

    /**
     * Translate the current point by the given isometry.
     * @abstract
     * @param {Isometry} isom - the isometry to apply
     * @return {Point} The current point
     */
    applyIsometry(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Reduce possible errors
     * @abstract
     * @return {Point} The current point
     */
    reduceError() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Check if the current point and `point ` are the same.
     * Mainly for debugging purposes.
     * @abstract
     * @param {Point} point
     * @return {boolean} true if the points are equal, false otherwise
     */
    equals(point) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return a new copy of the current point.
     * @abstract
     * @return {Point} the clone of the current point
     */
    clone() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * set the current point with the given point
     * @abstract
     * @param {Point} point - the point to copy
     * @return {Point} The current point
     */
    copy(point) {
        throw new Error("This method need be overloaded.");
    }
}


export {
    Point
}