import {GroupElement as AbstractGroupElement} from "../../../../core/groups/GroupElement.js";
import {Isometry} from "../../geometry/Isometry.js";
import {Quaternion} from "three";

/**
 * @class
 *
 * @classdesc
 * Unit integer quaternions, represented
 * - as a integer Quaternion on a the JS side
 * - as an integer vec4 on the GLSL side
 */
export class GroupElement extends AbstractGroupElement {

    constructor(group, x = 0, y = 0, z = 0, w = 1) {
        super(group);
        this.quaternion = new Quaternion(x, y, z, w);
    }

    /**
     * the only way to pass an integer vector to the shader is as an array and not a Vector3
     * @type {number[]}
     */
    get icoords() {
        return this.quaternion.toArray();
    }


    identity() {
        this.quaternion.identity();
        return this;
    }

    multiply(elt) {
        this.quaternion.multiply(elt.quaternion);
        return this;
    }

    premultiply(elt) {
        this.quaternion.premultiply(elt.quaternion);
        return this;
    }

    invert() {
        this.quaternion.conjugate();
        return this;
    }

    toIsometry() {
        const [x, y, z, w] = this.quaternion.toArray();
        const res = new Isometry();
        res.matrix.set(
            w, -z, -y, -x,
            z, w, x, -y,
            y, -x, w, z,
            x, y, -z, w
        );
        return res;
    }

    equals(elt) {
        return this.quaternion.equals(elt.quaternion);
    }

    clone() {
        const res = new GroupElement(this.group);
        res.quaternion.copy(this.quaternion);
        return res;
    }

    copy(elt) {
        this.quaternion.copy(elt.quaternion);
        return this;
    }
}
