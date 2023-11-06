import {Vector2} from "three";

import {GroupElement as AbstractGroupElement} from "../../../../core/geometry/GroupElement.js";
import {Isometry} from "../../geometry/Isometry.js";


/**
 * @class
 *
 * @classdesc
 * In this group an element is both an isometry of H3
 * and its image in a suitable finite group
 *
 * (Dihedral group of order 6(?) represented as the semi-direct product (Z/3) \rtimes (Z/2))
 */

export class GroupElement extends AbstractGroupElement {

    constructor(group) {
        super(group);
        this.isom = new Isometry();
        this.finitePart = new Vector2(0, 1);
    }

    identity() {
        this.isom.identity();
        this.finitePart.set(0, 1);
        return this;
    }

    multiply(elt) {
        this.isom.multiply(elt.isom);
        const aux = this.finitePart.x + this.finitePart.y* elt.finitePart.x;
        this.finitePart.set(
            // Note that we are not using the % operator
            // Indeed this operator return a negative if the operand in negative
            // This is not the behavior that we want.
            aux - 3 * Math.floor(aux / 3),
            this.finitePart.y * elt.finitePart.y
        )
        return this;
    }

    premultiply(elt) {
        this.isom.premultiply(elt.isom);
        const aux = elt.finitePart.x + elt.finitePart.y * this.finitePart.x;
        this.finitePart.set(
            // Same remark as above for the % operator.
            aux - 3 * Math.floor(aux / 3),
            elt.finitePart.y * this.finitePart.y
        )
        return this;
    }

    invert() {
        this.isom.invert();
        this.finitePart.set(
            (-this.finitePart.y * this.finitePart.x) % 3,
            this.finitePart.y
        );
        return this;
    }

    toIsometry() {
        return this.isom;
    }

    // Produce a number between 0 and 5 characterizing the finite part of the element
    hash() {
        const fp = this.finitePart;
        return fp.x + 3 * (fp.y + 1) / 2;
    }

    equals(elt) {
        return this.isom.equals(elt.isom);
    }

    clone() {
        const res = new GroupElement(this.group);
        res.isom.copy(this.isom);
        res.finitePart.copy(this.finitePart);
        return res;
    }

    copy(elt) {
        this.isom.copy(elt.isom);
        this.finitePart.copy(elt.finitePart);
        return this;
    }
}
