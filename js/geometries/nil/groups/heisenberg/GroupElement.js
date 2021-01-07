import {Vector3} from "../../../../lib/three.module.js";

import {GroupElement} from "../../../../core/groups/GroupElement.js";
import {Isometry} from "../../geometry/Isometry.js";


/**
 * Integral Heisenberg group
 * Element are represented as Vector3 with integer coordinates (both on the JS and the GLSL side).
 * The coordinates of the group element correspond to the Heisenberg model of Nil (to keep integer coordinates).
 * However the isometry is in the projective model.
 */


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
    const [a1, b1, c1] = this.coords.toArray();
    const [a2, b2, c2] = elt.coords.toArray();
    this.coords.set(a1 + a2, b1 + b2, c1 + c2 + a1 * b2);
    return this;
}

GroupElement.prototype.premultiply = function (elt) {
    const [a1, b1, c1] = elt.coords.toArray();
    const [a2, b2, c2] = this.coords.toArray();
    this.coords.set(a1 + a2, b1 + b2, c1 + c2 + a1 * b2);
    return this;
}

GroupElement.prototype.invert = function () {
    const [a, b, c] = this.coords.toArray();
    this.coords.set(-a, -b, -c + a * b);
    return this;
}

GroupElement.prototype.toIsometry = function () {
    const [a, b, c] = this.coords.toArray();
    const res = new Isometry();
    res.matrix.set(
        1, 0, 0, a,
        0, 1, 0, b,
        -0.5 * b, 0.5 * a, 1, c - 0.5 * a * b,
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