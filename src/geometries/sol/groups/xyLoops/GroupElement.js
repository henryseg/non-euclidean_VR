import {Vector2} from "three";
import {Isometry} from "../../geometry/Isometry.js";
import {GroupElement as AbstractGroupElement} from "../../../../core/groups/GroupElement.js";

import {Point} from "../../geometry/Point.js";

/**
 * @class
 * @classdesc
 * Element in Z^2
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
        const point = new Point(
            a * this.group.dirA.x + b * this.group.dirB.x,
            a * this.group.dirA.y + b * this.group.dirB.y,
            0,
            1
        );
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

