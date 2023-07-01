import {Vector2, Matrix4} from "three";

import {GroupElement as AbstractGroupElement} from "../../../../core/groups/GroupElement.js";
import {Isometry} from "../../geometry/Isometry.js";


/**
 * @class
 * Element in Z/n x Z represented as Vector2
 */
export class GroupElement extends AbstractGroupElement {

    /**
     * Constructor
     * @param {Group} group - the underlying group
     * @param {number} x - the finite part
     * @param {number} y - the infinite part
     */
    constructor(group, x = 0, y = 0) {
        super(group);
        this.coords = new Vector2(x % this.group.n, y);
    }

    identity() {
        this.coords.set(0, 0);
        return this;
    }

    multiply(elt) {
        this.coords.add(elt.coords);
        this.coords.setX(this.coords.x % this.group.n);
        return this;
    }

    premultiply(elt) {
        // the group is abelian !
        return this.multiply(elt);
    }

    invert() {
        this.coords.multiplyScalar(-1);
        return this;
    }

    toIsometry() {
        const angle = this.coords.x * this.group.angle;
        const res = new Isometry();
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        res.matrix = new Matrix4().set(
            1, 0, 0, 0,
            0, c, -s, 0,
            0, s, c, 0,
            0, 0, 0, 1
        )
        res.shift = 2 * this.group.halfHeight * this.coords.y;
        return res;
    }

    equals(elt) {
        return this.coords.equals(elt.coords);
    }

    clone() {
        const res = this.group.element();
        res.coords.copy(this.coords);
        return res;
    }

    copy(elt) {
        this.coords.copy(elt.coords);
        return this;
    }
}
