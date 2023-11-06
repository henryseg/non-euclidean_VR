import {QUAD_RING} from "./Group.js";
import {GroupElement as AbstractGroupElement} from "../../../../core/geometry/GroupElement.js";
import {QuadRingMatrix4} from "../../../../utils/quadRing/QuadRingMatrix4.js";
import {Isometry} from "../../../../core/geometry/Isometry.js";



/**
 * @class
 *
 * @classdesc
 * Translation group whose fundamental domain is an ideal cube in H3
 */
export class GroupElement extends AbstractGroupElement {

    constructor(group) {
        super(group);
        this.matrix = new QuadRingMatrix4(QUAD_RING);
    }

    identity() {
        this.matrix.identity();
        return this;
    }

    multiply(elt) {
        this.matrix.multiply(elt.matrix);
        return this;
    }

    premultiply(elt) {
        this.matrix.premultiply(elt.matrix);
        return this;
    }

    invert() {
        this.matrix.invert();
        return this;
    }

    toIsometry() {
        const res = new Isometry();
        res.matrix.copy(this.matrix.toMatrix4());
        return res;
    }

    equals(elt) {
        return this.matrix.equals(elt.matrix);
    }

    clone() {
        const res = new GroupElement(this.group);
        res.matrix.copy(this.matrix);
        return res;
    }

    copy(elt) {
        this.matrix.copy(elt.matrix);
        return this;
    }

}

