import {Vector3} from "three";

import {GroupElement as AbstractGroupElement} from "../../../../core/geometry/GroupElement.js";
import {Isometry} from "../../geometry/Isometry.js";


/**
 * @class
 *
 * @classdesc
 * Element in the fundamental group of the Hantzsche-Wendt manifold
 * Elements are represented by two triples :
 * - (ax,ay,az) where ax, ay, az belong to {±1} and ax * ay * az = 1
 * - (ux,uy,uz) an integer value vector.
 * The group law is the one of a semi-direct product (see group description)
 * We make it compatible with the standard conventions of isometries of E^3.
 * An isometry of E^3 has the form T * R, where R is a rotation fixing the origin and T a translation.
 * Hence, the product of isometries is (T1 R1) (T2 R2) = T R where
 * - R = R1 R2
 * - T = T1 (R1 T2 R1^{-1})
 * In our description of the semi-direct product, `u` encodes the translation and `a` the rotation.
 */

export class GroupElement extends AbstractGroupElement {

    constructor(group) {
        super(group);
        this.rotation = new Vector3(1, 1, 1);
        this.translation = new Vector3(0, 0, 0);
    }

    /**
     * the only way to pass an integer vector to the shader is as an array and not a Vector3
     * @type{number[]}
     */
    get irotation() {
        return this.rotation.toArray();
    }

    /**
     * the only way to pass an integer vector to the shader is as an array and not a Vector3
     * @type{number[]}
     */
    get itranslation() {
        return this.translation.toArray();
    }

    setRotation(x, y, z) {
        this.rotation.set(x, y, z);
        return this;
    }

    setTranslation(x, y, z) {
        this.translation.set(x, y, z);
        return this;
    }


    identity() {
        this.rotation.set(1, 1, 1);
        this.translation.set(0, 0, 0);
        return this;
    }

    multiply(elt) {
        // Three.js vector multiplication acts component wise.
        const rotation = new Vector3().multiplyVectors(this.rotation, elt.rotation);
        const translation = new Vector3().addVectors(
            this.translation,
            new Vector3().multiplyVectors(this.rotation, elt.translation)
        );
        this.rotation.copy(rotation);
        this.translation.copy(translation);
        return this;
    }

    premultiply(elt) {
        const rotation = new Vector3().multiplyVectors(elt.rotation, this.rotation);
        const translation = new Vector3().addVectors(
            elt.translation,
            new Vector3().multiplyVectors(elt.rotation, this.translation)
        );
        this.rotation.copy(rotation);
        this.translation.copy(translation);
        return this;
    }

    invert() {
        const translation = new Vector3()
            .multiplyVectors(this.rotation, this.translation)
            .negate();
        this.translation.copy(translation);
        return this;
    }

    toIsometry() {
        const [ax, ay, az] = this.rotation.toArray();
        const [ux, uy, uz] = this.translation.toArray();
        const res = new Isometry();
        res.matrix.set(
            ax, 0, 0, this.group.length * ux,
            0, ay, 0, this.group.length * uy,
            0, 0, az, this.group.length * uz,
            0, 0, 0, 1
        );
        return res;
    }

    equals(elt) {
        return this.rotation.equals(elt.rotation) && this.translation.equals(elt.rotation);
    }

    copy(elt) {
        this.rotation.copy(elt.rotation);
        this.translation.copy(elt.translation);
        return this;
    }

    clone() {
        const res = new GroupElement(this.group);
        res.copy(this);
        return res;
    }
}
