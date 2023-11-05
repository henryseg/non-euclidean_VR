/**
 * @class
 *
 * @classdesc
 * Isometry of the geometry.
 */
class Isometry {

    /**
     * Constructor.
     *
     * Since the constructor is different for each geometry, it delegates the task to the method `build`
     * (that can be overwritten easily unlike the constructor).
     * Another way to do would be to implement for each geometry a new class that inherit from Isometry.
     * However, the drawback is that the class Position would need also to be extended,
     * so that it manipulate the right classes.
     *
     */
    constructor() {
        this.build(...arguments);
    }

    /**
     * True if the object implements the class `Isometry`
     * @return {boolean}
     */
    get isIsometry() {
        return true;
    }

    /**
     * Fake constructor
     * If no argument is passed, should return the identity.
     * @abstract
     */
    build() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Set the current isometry to the identity.
     * @abstract
     * @return {Isometry} The current isometry
     */
    identity() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Reduce the eventual numerical errors of the current isometry
     * (e.g. Gram-Schmidt for orthogonal matrices).
     * @abstract
     * @return {Isometry} The current isometry
     */
    reduceError() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Multiply the current isometry by `isom` on the left, i.e. replace `this` by `this` * `isom`.
     * @abstract
     * @param {Isometry} isom
     * @return {Isometry} The current isometry
     */
    multiply(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Multiply the current isometry by `isom` on the right, i.e. replace `this` by `isom` * `this`.
     * @abstract
     * @param {Isometry} isom
     * @return {Isometry} The current isometry
     */
    premultiply(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Set the current isometry to its inverse
     * @return {Isometry} The current isometry
     */
    invert() {
        this.matrix.invert();
        return this;
    }

    /**
     * Set the current isometry to a preferred one sending the origin to the given point
     * (typically in Nil, Sol, SL2, etc).
     * @abstract
     * @param {Point} point - the target point
     * @return {Isometry} The current isometry
     */
    makeTranslation(point) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Set the current isometry to a preferred one sending the given point to the origin
     * (typically in Nil, Sol, SL2, etc).
     * The returned isometry should be the inverse of the one generated by `makeTranslation`.
     * @abstract
     * @param {Point} point - the point that is moved back to the origin
     * @return {Isometry} The current isometry
     */
    makeInvTranslation(point) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Set the current isometry to a preferred one sending the origin to the image of v by the exponential map.
     * @abstract
     * @param {Vector} vec - the vector in the tangent space
     * @return {Isometry} The current isometry
     */
    makeTranslationFromDir(vec) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Take as input a Matrix4 m, seen as an isometry of the tangent space at the origin (in the reference frame)
     * and set the current isometry so that its differential is dexp * dm, where
     * - dexp is the differential of the exponential map
     * - dm is the differential of m
     * @todo turn it into an abstract method, when implemented in all geometries
     * @param {Matrix4} m - an isometry of the tangent space
     * @return {Isometry} The current isometry
     */
    diffExpMap(m) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Check if the current isometry and `isom` are the same.
     * Mainly for debugging purposes.
     * @abstract
     * @param isom
     * @return {boolean} true if the isometries are equal, false otherwise
     */
    equals(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Set the current isometry with the given isometry
     * @abstract
     * @param {Isometry} isom - the isometry to copy
     * @return {Isometry} The current isometry
     */
    copy(isom) {

        throw new Error("This method need be overloaded.");
    }

    /**
     * Return a new copy of the current isometry.
     * @return {Isometry} The clone of the current isometry
     */
    clone() {
        const res = new Isometry();
        res.copy(this);
        return res;
    }

}

export {
    Isometry
}