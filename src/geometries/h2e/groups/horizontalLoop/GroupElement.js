import {GroupElement as AbstractGroupElement} from "../../../../core/groups/GroupElement.js";
import {Isometry} from "../../geometry/Isometry.js";


/**
 * @class
 *
 * @classdesc
 * Element in Z
 */

export class GroupElement extends AbstractGroupElement {

    constructor(group, n = 0) {
        super(group);
        this.value = n;
    }

    identity() {
        this.value = 0;
        return this;
    }

    multiply(elt) {
        this.value = this.value + elt.value;
        return this;
    }

    premultiply(elt) {
        this.value = this.value + elt.value;
        return this;
    }

    invert() {
        this.value = -this.value;
        return this;
    }

    toIsometry() {
        const translation = this.group.halfTranslation.clone().multiplyScalar(2 * this.value);
        return new Isometry().makeTranslationFromDir(translation);
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
