import {Vector3} from "three";

import {GroupElement as AbstractGroupElement} from "../../../../core/geometry/GroupElement.js";
import {Isometry} from "../../geometry/Isometry.js";


/**
 * @class
 *
 * @classdesc
 * Element in the fundamental group of the Klein bottle x S^1
 * Elements are represented as Vector3 with integer coordinates x,y,z (both on the JS and the GLSL side)
 * - The group law is
 *      (x1, y1, z1) (x2, y2, z2) = (x1 + x2, y1 + (-1) ** x1 * y2, z1 + z2)
 * - <x1, y1> is the Klein bottle group, with x1 being corresponding to the "flipped" gluing
 * - <z1> is the fundamental group of S^1
 *
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
        const flip = 1 - 2 * (this.coords.x % 2);
        const auxCoords = elt.coords.clone();
        auxCoords.setY(flip * elt.coords.y);
        this.coords.add(auxCoords);
        return this;
    }

    premultiply(elt) {
        const flip = 1 - 2 * (elt.coords.x % 2);
        this.coords.setY(flip * this.coords.y);
        this.coords.add(elt.coords);
        return this;
    }

    invert() {
        const flip = 1 - 2 * (this.coords.x % 2);
        this.coords.setY(flip * this.coords.y);
        this.coords.negate();
        return this;
    }

    toIsometry() {
        const [a, b, c] = this.coords.toArray();
        const flip = 1 - 2 * (a % 2);
        const res = new Isometry();
        res.matrix.set(
            1, 0, 0, 2 * this.group.halfWidth * a,
            0, flip, 0, 2 * this.group.halfWidth * b,
            0, 0, flip, 2 * this.group.halfWidth * c,
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
