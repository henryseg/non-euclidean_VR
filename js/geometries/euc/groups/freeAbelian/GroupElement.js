import {GroupElement} from "../../../../core/groups/GroupElement.js";
import {Isometry} from "../../geometry/Isometry.js";
import {Vector3} from "../../../../lib/three.module.js";

/**
 * Default representation of a subgroup : just directly use the isometries.
 */

export const cubeHalfWidth = 0.8;

GroupElement.prototype.build = function () {
    if (arguments.length === 0) {
        this.coords = new Vector3(0, 0, 0);
    } else {
        this.coords = new Vector3(...arguments);
    }
}

// the only way to pass an integer vector to the shader is as an array and not a Vector3
Object.defineProperty(GroupElement.prototype, 'icoords', {
    get: function () {
        return this.coords.toArray();
    }
})

GroupElement.prototype.identity = function () {
    this.coords.set(0, 0, 0);
    return this;
}

GroupElement.prototype.multiply = function (elt) {
    this.coords.add(elt.coords);
    return this;
}

GroupElement.prototype.premultiply = function (elt) {
    this.coords.add(elt.coords);
    return this;
}

GroupElement.prototype.invert = function () {
    this.coords.negate();
    return this;
}

GroupElement.prototype.toIsometry = function () {
    const [a, b, c] = this.coords.toArray();
    const res = new Isometry();
    res.matrix.set(
        1, 0, 0, 2 * a * cubeHalfWidth,
        0, 1, 0, 2 * b * cubeHalfWidth,
        0, 0, 1, 2 * c * cubeHalfWidth,
        0, 0, 0, 1
    );
    return res;
}

GroupElement.prototype.equals = function (elt) {
    return this.coords.equals(elt.coords);
}

GroupElement.prototype.clone = function () {
    const res = new GroupElement();
    res.coords.copy(this.coords);
    return res;
}

GroupElement.prototype.copy = function (elt) {
    this.coords.copy(elt.coords);
    return this;
}

export {GroupElement};