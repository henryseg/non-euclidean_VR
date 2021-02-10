import {Vector3} from "../../../../lib/three.module.js";
import {Isometry} from "../../geometry/Isometry.js";
import {GroupElement as AbstractGroupElement} from "../../../../core/groups/GroupElement.js";

/**
 * @class
 *
 * @classdesc
 * Integral Heisenberg group element
 * Element are represented as Vector3 with integer coordinates (both on the JS and the GLSL side).
 * The coordinates of the group element correspond to the Heisenberg model of Nil (to keep integer coordinates).
 * However the isometry is in the projective model.
 */
export class GroupElement extends AbstractGroupElement {

    constructor(group, x = 0, y = 0, z = 0) {
        super(group);
        this.coords = new Vector3(x, y, z);
    }

    /**
     * the only way to pass an integer vector to the shader is as an array and not a Vector3
     * @return {number[]}
     */
    get icoords() {
        return this.coords.toArray();
    }


    identity() {
        this.coords.set(0, 0, 0);
        return this;
    }

    multiply(elt) {
        const [a1, b1, c1] = this.coords.toArray();
        const [a2, b2, c2] = elt.coords.toArray();
        this.coords.set(a1 + a2, b1 + b2, c1 + c2 + a1 * b2);
        return this;
    }

    premultiply(elt) {
        const [a1, b1, c1] = elt.coords.toArray();
        const [a2, b2, c2] = this.coords.toArray();
        this.coords.set(a1 + a2, b1 + b2, c1 + c2 + a1 * b2);
        return this;
    }

    invert() {
        const [a, b, c] = this.coords.toArray();
        this.coords.set(-a, -b, -c + a * b);
        return this;
    }

    toIsometry() {
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

    equals(elt) {
        return this.coords.equals(elt.coords);
    }

    clone() {
        const res = new GroupElement(this.group);
        res.coords.copy(this.coords);
        return res;
    }

    copy(elt) {
        this.coords.copy(elt.coords);
        return this;
    }
}

