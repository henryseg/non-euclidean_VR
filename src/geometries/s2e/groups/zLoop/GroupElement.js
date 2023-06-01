import {Vector2} from "three";

import {GroupElement as AbstractGroupElement} from "../../../../core/groups/GroupElement.js";
import {Isometry} from "../../geometry/Isometry.js";


/**
 * @class
 *
 * @classdesc
 * Default representation of a subgroup : just directly use the isometries.
 */
export class GroupElement extends AbstractGroupElement {

    constructor(group) {
        super(group);
        this.isom = new Isometry();
    }

    identity() {
        this.isom.identity();
        return this;
    }

    multiply(elt) {
        this.isom.multiply(elt.isom);
        return this;
    }

    premultiply(elt) {
        this.isom.premultiply(elt.isom);
        return this;
    }

    invert() {
        this.isom.invert();
        return this;
    }

    toIsometry() {
        return this.isom.clone();
    }

    equals(elt) {
        return this.isom.equals(elt.isom);
    }

    clone() {
        const res = new GroupElement();
        res.isom.copy(this.isom);
        return res;
    }

    copy(elt) {
        this.isom.copy(elt.isom);
        return this;
    }
}
