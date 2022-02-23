import {Vector3} from "three";
import {Isometry} from "../../geometry/Isometry.js";
import {GroupElement as AbstractGroupElement} from "../../../../core/groups/GroupElement.js";

import {A, PHI, DENUM, TAU} from "./Group.js";
import {Point} from "../../geometry/Point.js";

/**
 * @class
 * @classdesc
 * Element in the suspension of Z^2 by Z, where Z acts on Z^2 ast the matrix A from Group.js
 * The first two coordinates (a,b) correspond to the Z^2 factor
 * The last coordinates c correspond to the Z factor
 */
export class GroupElement extends AbstractGroupElement {

    constructor(group, a = 0, b = 0, c = 0) {
        super(group);
        this.coords = new Vector3(a, b, c);
        this.matrix = A.clone().power(c);
    }

    identity() {
        this.coords.set(0, 0, 0);
        this.matrix.identity();
        return this;
    }

    multiply(elt) {
        this.coords.add(elt.coords.applyMatrix3(this.matrix));
        this.matrix.multiply(elt.matrix);
        return this;
    }

    premultiply(elt) {
        this.coords.applyMatrix3(elt.matrix).add(elt.coords);
        this.matrix.premultiply(elt.matrix);
        return this;
    }

    invert() {
        this.matrix.invert();
        this.coords.applyMatrix3(this.matrix).negate();
        return this;
    }

    toIsometry() {
        const [a, b, c] = this.coords.toArray();
        const point = new Point((a * PHI + b) * DENUM, (-a + b * PHI) * DENUM, c * TAU, 1);
        return new Isometry().makeTranslation(point);
    }

    equals(elt) {
        return this.coords.equals(elt.coords);
    }

    clone() {
        const res = new GroupElement(this.group);
        res.coords.copy(this.coords);
        res.matrix.copy(this.matrix);
        return res;
    }

    copy(elt) {
        this.coords.copy(elt.coords);
        this.matrix.copy(elt.matrix);
        return this;
    }
}

