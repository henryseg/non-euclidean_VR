import {Vector2} from "three";
import {Isometry} from "../../geometry/Isometry.js";
import {GroupElement as AbstractGroupElement} from "../../../../core/groups/GroupElement.js";

import {PHI, DENUM} from "./Group.js";
import {Point} from "../../geometry/Point.js";

/**
 * @class
 * @classdesc
 * Element in the suspension of Z^2 by Z, where Z acts on Z^2 ast the matrix A from Group.js
 * The first two coordinates (a,b) correspond to the Z^2 factor
 * The last coordinates c correspond to the Z factor
 */
export class GroupElement extends AbstractGroupElement {

    constructor(group, a = 0, b = 0) {
        super(group);
        this.coords = new Vector2(a, b);
    }

    identity() {
        this.coords.set(0, 0);
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
        const [a, b] = this.coords.toArray();
        const point = new Point((a * PHI + b) * DENUM, (-a + b * PHI) * DENUM, 0, 1);
        return new Isometry().makeTranslation(point);
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

