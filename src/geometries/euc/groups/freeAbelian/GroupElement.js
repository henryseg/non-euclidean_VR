import {Vector3} from "three";

import {GroupElement as AbstractGroupElement} from "../../../../core/groups/GroupElement.js";
import {Isometry} from "../../geometry/Isometry.js";


/**
 * @class
 *
 * @classdesc
 * Element in a free abelian group
 * Elements are represented as Vector3 with integer coordinates (both on the JS and the GLSL side)
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
        const [a, b, c] = this.coords.toArray();
        const translation = new Vector3()
            .add(this.group.halfTranslationA.clone().multiplyScalar(2 * a))
            .add(this.group.halfTranslationB.clone().multiplyScalar(2 * b))
            .add(this.group.halfTranslationC.clone().multiplyScalar(2 * c));
        const res = new Isometry();
        res.matrix.set(
            1, 0, 0, translation.x,
            0, 1, 0, translation.y,
            0, 0, 1, translation.z,
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
