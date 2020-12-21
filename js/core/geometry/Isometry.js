/**
 * @class
 *
 * @classdesc
 * Isometry of the geometry.
 */
class Isometry {

    /**
     * Constructor.
     * Since the constructor is different for each geometry, it delegates the task to the method `build`
     * (that can be overwritten easily unlike the constructor).
     * Another way to do would be to implement for each geometry a new class that inherit from Isometry.
     * How ever the drawback is that the class Position would need also to be extended,
     * so that it manipulate the right classes.
     *
     */
    constructor(...args) {
        this.build(...args);
    }

    /**
     * Fake constructor
     * If no argument is passed, return the identity.
     * @abstract
     */
    build() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Reduce the eventual numerical errors of the current isometry (typically Gram-Schmidt).
     * @abstract
     * @return {Isometry} The current isometry
     */
    reduceError() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Multiply the current isometry by isom on the left, i.e. replace `this` by `this * isom`.
     * @abstract
     * @param {Isometry} isom
     * @return {Isometry} The current isometry
     */
    multiply(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Multiply the current isometry by isom on the right, i.e. replace `this` by `isom * this`.
     * @abstract
     * @param {Isometry} isom
     * @return {Isometry} The current isometry
     */
    premultiply(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Invert the current isometry
     *
     */
    invert() {
        this.matrix.invert();
        return this;
    }

    /**
     * Return a preferred isometry sending the origin to the given point
     * (typically in Nil, Sol, SL2, etc).
     * @abstract
     * @param {Point} point - the target point
     * @return {Isometry} The current isometry
     */
    makeTranslation(point) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return a preferred isometry sending the given point to the origin
     * (typically in Nil, Sol, SL2, etc).
     * @abstract
     * @param {Point} point - the point that is moved back to the orign
     * @return {Isometry} The current isometry
     */
    makeInvTranslation(point) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return a preferred isometry sending the origin to the image of v by the exponential map.
     * @abstract
     * @param {Vector} vec - the vector in the tangent space
     * @return {Isometry} The current isometry
     */
    makeTranslationFromDir(vec) {
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
     * Return a new copy of the current isometry.
     * @abstract
     * @return {Isometry} The clone of the current isometry
     */
    clone() {
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
     * Return a block of GLSL code creating the same isometry
     * Used when dynamically building shaders.
     * @abstract
     * @return {string} the equivalent GLSL code
     */
    toGLSL() {
        throw new Error("This method need be overloaded.");
    }
}

export {
    Isometry
}