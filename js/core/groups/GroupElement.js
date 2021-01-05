/**
 * @class
 *
 * @classdesc
 * Group element.
 * This class allows to define a symbolic representation for element of a discrete subgroups os isometries.
 * There is no class for the group itself. The group is the collection of all its elements.
 */
export class GroupElement {

    /**
     * Constructor.
     */
    constructor() {
        this.build(...arguments);
    }

    /**
     * Fake constructor.
     * If no argument is provided set the element to the identity.
     */
    build() {
        throw new Error("GroupElement: This method need be overloaded.");
    }

    /**
     * Set the current element to the identity.
     * @return {GroupElement} the current element
     */
    identity() {
        throw new Error("GroupElement: This method need be overloaded.");
    }


    /**
     * Multiply the current element by elt on the left, i.e. replace `this` by `this * elt`.
     * @abstract
     * @param {GroupElement} elt
     * @return {GroupElement} The current element
     */
    multiply(elt) {
        throw new Error("GroupElement: This method need be overloaded.");
    }

    /**
     * Multiply the current element by elt on the right, i.e. replace `this` by `elt * this`.
     * @abstract
     * @param {GroupElement} elt
     * @return {GroupElement} The current element
     */
    premultiply(elt) {
        throw new Error("GroupElement: This method need be overloaded.");
    }

    /**
     * Invert the current element
     * @return {GroupElement} the current element
     */
    invert() {
        throw new Error("GroupElement: This method need be overloaded.");
    }

    /**
     * Convert the current element to an isometry
     * @return{Isometry}
     */
    toIsometry() {
        throw new Error("GroupElement: This method need be overloaded.");
    }

    /**
     * Check if the current element and `isom` are the same.
     * Mainly for debugging purposes.
     * @abstract
     * @param {GroupElement} elt
     * @return {boolean} true if the elements are equal, false otherwise
     */
    equals(elt) {
        throw new Error("GroupElement: This method need be overloaded.");
    }

    /**
     * Return a new copy of the current element.
     * @abstract
     * @return {GroupElement} The clone of the current element
     */
    clone() {
        throw new Error("GroupElement: This method need be overloaded.");
    }

    /**
     * Set the current element with the given element
     * @abstract
     * @param {GroupElement} elt - the element to copy
     * @return {GroupElement} The current element
     */
    copy(elt) {
        throw new Error("GroupElement: This method need be overloaded.");
    }
}