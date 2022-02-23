import {GroupElement as AbstractGroupElement} from "../../../core/groups/GroupElement.js";
import {Isometry} from "../../../core/geometry/General.js";

/**
 * @class
 *
 * @classdesc
 * Element of the trivial group... just nothing to do!
 */
export class GroupElement extends AbstractGroupElement {

    constructor(group) {
        super(group)
        // Define a fake property to pass to the GLSL side.
        // Indeed a GLSL structure cannot be empty
        this.fake = true;
    }

    identity() {
        return this;
    }

    multiply(elt) {
        return this;
    }

    premultiply(elt) {
        return this;
    }

    invert() {
        return this;
    }

    toIsometry() {
        return new Isometry();
    }

    equals(elt) {
        return true;
    }

    clone() {
        return new GroupElement();
    }

    copy(elt) {
        return this;
    }
}