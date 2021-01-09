import {GroupElement as AbstractGroupElement} from "../../../../core/groups/GroupElement.js";
import {Isometry} from "../../geometry/Isometry.js";
import {Vector3} from "../../../../lib/three.module.js";

/**
 * @class
 *
 * @classdesc
 * Element in a free abelian group
 * Elements are represented as Vector3 with integer coordinates (both on the JS and the GLSL side)
 */

export class GroupElement extends AbstractGroupElement {

    constructor(group, x = 0, y = 0, z = 0) {
        super(group);
        this.coords = new Vector3(x, y, z);
    }

    /**
     * the only way to pass an integer vector to the shader is as an array and not a Vector3
     * @type{number[]}
     */
    get icoords() {
        return this.coords.toArray();
    }


    identity() {
        this.coords.set(0, 0, 0);
        return this;
    }

    multiply(elt) {
        this.coords.add(elt.coords);
        return this;
    }

    premultiply(elt) {
        this.coords.add(elt.coords);
        return this;
    }

    invert() {
        this.coords.negate();
        return this;
    }

    toIsometry() {
        const [a, b, c] = this.coords.toArray();
        const res = new Isometry();
        res.matrix.set(
            1, 0, 0, 2 * a * this.group.cubeHalfWidth,
            0, 1, 0, 2 * b * this.group.cubeHalfWidth,
            0, 0, 1, 2 * c * this.group.cubeHalfWidth,
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
