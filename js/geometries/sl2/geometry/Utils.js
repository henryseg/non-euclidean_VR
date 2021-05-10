import {Matrix3, Matrix4, Vector3, Vector4} from "../../../lib/three.module.js";

/**

 * @class
 * @classdesc
 * The elements of SL(2,R) seen as vectors in the basis E = (E0,E1,E2,E3)
 * The elements satisfy the relation - x^2 - y^2 + z^2 + w^2 = -1
 */
export class SL2 extends Vector4 {

    /**
     * Overload the constructor to return the identity.
     */
    constructor() {
        super(...arguments);
        if (arguments.length === 0) {
            this.set(1, 0, 0, 0);
        }
    }

    /**
     * Projection from SL(2,R) to SO(2,1)
     * @returns {Matrix3} - the image of the current element in SO(2,1)
     */
    toMatrix3() {
        let aux1 = new Matrix4().set(
            this.x, -this.y, this.z, -this.w,
            this.y, this.x, this.w, this.z,
            this.z, this.w, this.x, this.y,
            0, 0, 0, 0
        );
        let aux2 = new Matrix4().set(
            this.x, -this.y, this.z, 0,
            this.y, this.x, this.w, 0,
            this.z, this.w, this.x, 0,
            this.w, -this.z, this.y, 0
        );
        let aux = aux1.multiply(aux2);
        return new Matrix3().setFromMatrix4(aux);
    }

    /**
     * Projection onto H^2
     * @returns {Vector3} - the image of the origin in H^2 by the given element of SL(2,R)
     */
    toH2() {
        let m = this.toMatrix3();
        let res = new Vector3().set(0, 0, 1);
        res.applyMatrix3(m);
        return res;
    }

    /**
     * Return the 4x4 Matrix, corresponding to the current element, seen as an isometry of SL(2,R)
     * @returns {Matrix4} - the current element of SL(2,R) as an isometry of SL(2,R)
     */
    toMatrix4() {
        const [p0, p1, p2, p3] = this.toArray();
        return new Matrix4().set(
            p0, -p1, p2, p3,
            p1, p0, p3, -p2,
            p2, p3, p0, -p1,
            p3, -p2, p1, p0
        );
    }

    /**
     * Multiply the element on the right by isom, i.e. elt * this
     * @param {SL2} elt - the right element in the product
     * @returns {SL2} - the current element
     */
    premultiply(elt) {
        let m = elt.toMatrix4();
        this.applyMatrix4(m);
        this.reduceError();
        return this;
    }

    /**
     * Multiply the element on the left by isom, i.e. this * elt
     * @param {SL2} elt - the left element in the product
     * @returns {SL2} - the current element
     */
    multiply(elt) {
        let m = this.toMatrix4();
        this.copy(elt.clone().applyMatrix4(m));
        this.reduceError();
        return this;
    }

    /**
     * Apply the "rotation" of angle alpha centered at the origin
     * @param {number} angle - the angle of the rotation
     * @returns {SL2} - the current element
     */
    rotateBy(angle) {
        let m = new Matrix4().set(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, Math.cos(angle), -Math.sin(angle),
            0, 0, Math.sin(angle), Math.cos(angle),
        );
        this.applyMatrix4(m);
        this.reduceError();
        return this;
    }

    /**
     * Apply the "flip"
     * @returns {SL2} - the current element
     */
    flip() {
        let m = new Matrix4().set(
            1, 0, 0, 0,
            0, -1, 0, 0,
            0, 0, 0, 1,
            0, 0, 1, 0
        );
        this.applyMatrix4(m);
        this.reduceError();
        return this;
    }

    /**
     * Translate the element by an angle `phi` along the fiber
     * @param {number} phi - the angle of translation
     * @returns {SL2} - the current element
     */
    translateFiberBy(phi) {
        let aux = 0.5 * phi
        let m = new Matrix4().set(
            Math.cos(aux), -Math.sin(aux), 0, 0,
            Math.sin(aux), Math.cos(aux), 0, 0,
            0, 0, Math.cos(aux), Math.sin(aux),
            0, 0, -Math.sin(aux), Math.cos(aux)
        );
        this.applyMatrix4(m);
        this.reduceError();
        return this;
    }

    /**
     * Set the current element to the inverse of the given element.
     * @returns {SL2} - the current element
     */
    invert() {
        this.set(this.x, -this.y, -this.z, -this.w);
        return this;
    }

    /**
     * Correct the error to make sure that the point lies on the "hyperboloid"
     * @returns {SL2} - the current element
     */
    reduceError() {
        let q = -Math.pow(this.x, 2) - Math.pow(this.y, 2) + Math.pow(this.z, 2) + Math.pow(this.w, 2);
        this.multiplyScalar(1 / Math.sqrt(-q));
        return this;
    }
}
