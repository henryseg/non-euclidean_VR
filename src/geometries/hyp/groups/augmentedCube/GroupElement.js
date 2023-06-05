import {Matrix3} from "three";

import {GroupElement as AbstractGroupElement} from "../../../../core/groups/GroupElement.js";
import {Isometry} from "../../geometry/Isometry.js";


/**
 * @class
 *
 * @classdesc
 * In this group an element is both an isometry of H3
 * and its image in a suitable finite group
 *
 * (Finite group Z/6 represented as an integer)
 */

export class GroupElement extends AbstractGroupElement {

    constructor(group) {
        super(group);
        this.isom = new Isometry();
        this.finitePart = 0;
    }

    identity() {
        this.isom.identity();
        this.finitePart.identity();
        return this;
    }

    multiply(elt) {
        this.isom.multiply(elt.isom);
        let aux = this.finitePart + elt.finitePart;
        aux = aux - 6 * Math.floor(aux / 6);
        this.finitePart = aux;
        return this;
    }

    premultiply(elt) {
        this.isom.premultiply(elt.isom);
        let aux = this.finitePart + elt.finitePart;
        aux = aux - 6 * Math.floor(aux / 6);
        this.finitePart = aux;
        return this;
    }

    invert() {
        this.isom.invert();
        let aux = -this.finitePart;
        aux = aux - 6 * Math.floor(aux / 6);
        this.finitePart = aux;
        return this;
    }

    toIsometry() {
        return this.isom;
    }

    equals(elt) {
        return this.isom.equals(elt.isom);
    }

    clone() {
        const res = new GroupElement(this.group);
        res.isom.copy(this.isom);
        res.finitePart = this.finitePart;
        return res;
    }

    copy(elt) {
        this.isom.copy(elt.isom);
        this.finitePart = elt.finitePart;
        return this;
    }
}
