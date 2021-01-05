import {GroupElement} from "../../../core/groups/GroupElement.js";
import {Isometry} from "../../../core/geometry/General.js";

/**
 * Default representation of a subgroup : just directly use the isometries.
 */


GroupElement.prototype.build = function () {
    this.isom = new Isometry();
}

GroupElement.prototype.identity = function () {
    this.isom.identity();
    return this;
}

GroupElement.prototype.multiply = function (elt) {
    this.isom.multiply(elt.isom);
    return this;
}

GroupElement.prototype.premultiply = function (elt) {
    this.isom.premultiply(elt.isom);
    return this;
}

GroupElement.prototype.invert = function () {
    this.isom.invert();
    return this;
}

GroupElement.prototype.toIsometry = function () {
    return this.isom.clone();
}

GroupElement.prototype.equals = function (elt) {
    return this.isom.equals(elt.isom);
}

GroupElement.prototype.clone = function () {
    const res = new GroupElement();
    res.isom.copy(this.isom);
    return res;
}

GroupElement.prototype.copy = function (elt) {
    this.isom.copy(elt.isom);
    return this;
}

export {GroupElement};