import {GroupElement} from "../../../core/groups/GroupElement.js";
import {Isometry} from "../../../core/geometry/General.js";

/**
 * Trivial group... absolutely nothing to do most of the time!
 */


GroupElement.prototype.build = function () {
    // Define a fake property to pass to the GLSL side.
    // Indeed a GLSL structure cannot be empty
    this.fake = true;
}


GroupElement.prototype.identity = function () {
    return this;
}

GroupElement.prototype.multiply = function (elt) {
    return this;
}

GroupElement.prototype.premultiply = function (elt) {
    return this;
}

GroupElement.prototype.invert = function () {
    return this;
}

GroupElement.prototype.toIsometry = function () {
    return new Isometry();
}

GroupElement.prototype.equals = function (elt) {
    return true;
}

GroupElement.prototype.clone = function () {
    return new GroupElement();
}

GroupElement.prototype.copy = function (elt) {
    return this;
}

export {GroupElement};