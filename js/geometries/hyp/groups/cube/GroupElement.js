import {D as QUAD_FIELD_D} from "../../../../utils/QuadFieldElt.js";
import {QuadFieldMatrix4} from "../../../../utils/QuadFieldMatrix4.js";
import {GroupElement} from "../../../../core/groups/GroupElement.js";
import {Isometry} from "../../../../core/geometry/Isometry.js";


/**
 * Translation group whose fundamental domain is an ideal cube in H3
 */

QUAD_FIELD_D = 3;


GroupElement.prototype.build = function () {
    this.matrix = new QuadFieldMatrix4();
}

GroupElement.prototype.identity = function () {
    this.matrix.identity();
    return this;
}

GroupElement.prototype.multiply = function (elt) {
    this.matrix.multiply(elt.matrix);
    return this;
}

GroupElement.prototype.premultiply = function (elt) {
    this.matrix.premultiply(elt.matrix);
    return this;
}

GroupElement.prototype.invert = function () {
    this.matrix.invert();
    return this;
}

GroupElement.prototype.toIsometry = function () {
    const res = new Isometry();
    res.matrix.copy(this.matrix.toMatrix4());
    return res;
}

GroupElement.prototype.equals = function (elt) {
    return this.matrix.equals(elt.matrix);
}

GroupElement.prototype.clone = function () {
    const res = new GroupElement();
    res.matrix.copy(this.matrix);
    return res;
}

GroupElement.prototype.copy = function (elt) {
    this.matrix.copy(elt.matrix);
    return this;
}


export {GroupElement}