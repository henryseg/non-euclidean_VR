import {GroupElement} from "../../../../core/groups/GroupElement.js";
import {Isometry} from "../../geometry/Isometry.js";
import {Quaternion} from "../../../../lib/three.module.js";

/**
 * Unit integer quaternions, represented
 * - as a integer Quaternion on a the JS side
 * - as an integer vec4 on the GLSL side
 */


GroupElement.prototype.build = function () {
    if (arguments.length === 0) {
        this.quaternion = new Quaternion(0, 0, 0, 1);
    } else {
        this.quaternion = new Quaternion(...arguments);
    }
}

// the only way to pass an integer vector to the shader is as an array and not a Vector3
Object.defineProperty(GroupElement.prototype, 'icoords', {
    get: function () {
        return this.quaternion.toArray();
    }
})

GroupElement.prototype.identity = function () {
    this.quaternion.identity();
    return this;
}

GroupElement.prototype.multiply = function (elt) {
    this.quaternion.multiply(elt.quaternion);
    return this;
}

GroupElement.prototype.premultiply = function (elt) {
    this.quaternion.premultiply(elt.quaternion);
    return this;
}

GroupElement.prototype.invert = function () {
    this.quaternion.conjugate();
    return this;
}

GroupElement.prototype.toIsometry = function () {
    const [x, y, z, w] = this.quaternion.toArray();
    const res = new Isometry();
    res.matrix.set(
        w, -z, -y, -x,
        z, w, x, -y,
        y, -x, w, z,
        x, y, -z, w
    );
    return res;
}

GroupElement.prototype.equals = function (elt) {
    return this.quaternion.equals(elt.quaternion);
}

GroupElement.prototype.clone = function () {
    const res = new GroupElement();
    res.quaternion.copy(this.quaternion);
    return res;
}

GroupElement.prototype.copy = function (elt) {
    this.quaternion.copy(elt.quaternion);
    return this;
}

export {GroupElement};