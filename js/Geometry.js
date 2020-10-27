/**
 * Module handling the given geometry.
 * Here : the universal cover of SL(2,R)
 *
 * @module Geometry.
 *
 */

import {
    Matrix3,
    Matrix4,
    Vector3,
    Vector4
} from "./module/three.module.js";

import {
    Position
} from "./Position.js";

/**
 * SL2 Elements
 *
 * The elements of SL(2,R) seen as vectors in the basis E = (E0,E1,E2,E3)
 * The elements satisfy the relation - x^2 - y^2 + z^2 + w^2 = -1
 * @class
 * @public
 * @see Jupyter Notebook
 */
class SL2 extends Vector4 {

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
        //
        return new Matrix4().set(
            this.x, -this.y, this.z, this.w,
            this.y, this.x, this.w, -this.z,
            this.z, this.w, this.x, -this.y,
            this.w, -this.z, this.y, this.x
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
     * @param {SL2} elt - the isometry to inverse
     * @returns {SL2} - the current isometry
     */
    getInverse(elt) {
        this.set(elt.x, -elt.y, -elt.z, -elt.w);
        return this;
    }

    /**
     * Correct the error to make sure that the point lies on the "hyperboloid"
     * @returns {SL2}
     */
    reduceError() {
        let q = -Math.pow(this.x, 2) - Math.pow(this.y, 2) + Math.pow(this.z, 2) + Math.pow(this.w, 2);
        this.multiplyScalar(1 / Math.sqrt(-q));
        return this;
    }
}

/**
 * Points in the universal cover X of SL(2,R)
 *
 * A point is given by
 * - its projection in SL(2,R)
 * - its fiber
 **
 * @class
 * @public
 */
class Point {

    /**
     * Create a new point whose coordinates corresponds to the origin
     */
    constructor() {
        this.proj = new SL2();
        this.proj.set(1, 0, 0, 0);
        this.fiber = 0.;
    }

    /**
     * Apply to the H^2 component a rotation of angle alpha centered at the origin
     * @param {number} angle - the rotation angle
     * @returns {Point} - the current point
     */
    rotateBy(angle) {
        this.proj.rotateBy(angle);
        return this;
    }

    /**
     * Apply the flip to the current point
     * @see Jupyter Notebook
     * @returns {Point} - the current point
     */
    flip() {
        this.proj.flip();
        this.fiber = -this.fiber;
        return this;
    }

    /**
     * Translate the point in the fiber by the given angle
     * @param {number} phi - the angle to translate
     * @returns {Point}
     */
    translateFiberBy(phi) {
        this.proj.translateFiberBy(phi);
        this.fiber = this.fiber + phi;
    }


    /**
     * Covering map from X to SL(2,R)
     * @returns {SL2} - the image of the point in SL(2,R)
     */
    toSL2() {
        return this.proj.clone();
    }

    /**
     * Return the current point as an element (x,y,z,w) of H^2 x R, where
     * - (x,y,z) are th coordinates of a point of H^2 with the hyperboloid model
     * - w is the fiber component
     * @returns {Vector4}
     */
    toVector4() {
        let aux = this.proj.toH2();
        return new Vector4(aux.x, aux.y, aux.z, this.fiber);

    }

    /**
     * Return the current point as an element (x,y,1,w) of H^2 x R, where
     * - (x,y,1) are th coordinates of a point of H^2 with the Klein model
     * - w is the fiber component
     * @returns {Vector4}
     */
    toKlein() {
        let aux = this.toVector4();
        return new Vector4(
            aux.x / aux.z,
            aux.y / aux.z,
            1,
            aux.w
        );
    }

    /**
     * Set the current point to the point described by (x,y,z,w) in H^2 x R, where
     * - (x,y,z) are th coordinates of a point of H^2 with the hyperboloid model
     * - w is the fiber component
     * @param {Vector4} vec - the point in H^2 x R
     * @returns {Point}
     */
    fromVector4(vec) {
        this.proj.set(
            Math.sqrt(0.5 * vec.z + 0.5),
            0.,
            vec.x / Math.sqrt(2. * vec.z + 2.),
            vec.y / Math.sqrt(2. * vec.z + 2.)
        )
        this.fiber = 0;
        this.translateFiberBy(vec.w);
        return this;
    }


    /**
     * Return the isometry that moves the origin to the current point
     * @returns {Isometry} - the appropriate isometry
     */
    makeTranslation() {
        let res = new Isometry()
        res.set([this.clone()])
        return res;
    }

    /**
     * Translate the point by the given isometry
     * @param {Isometry} isom - the isometry to apply
     * @returns {Point} - the translated point
     */
    translateBy(isom) {
        let aux = this.makeTranslation();
        aux.premultiply(isom);
        this.copy(aux.target);
        return this;
    }

    /**
     * Correct the point so that the H^2 component stays on the hyperboloid.
     * @returns {Point}
     */
    reduceError() {
        this.proj.reduceError();
        return this;
    }


    /**
     * Return an encoding of the point that can be passed to the shader
     * @returns {Vector4} - the "encoded" isometry
     */
    serialize() {
        return this.toVector4();
    }

    /**
     * Return a copy of the current point
     * @returns {Point}
     */
    clone() {
        let res = new Point()
        res.proj = this.proj.clone();
        res.fiber = this.fiber;
        return res;
    }


    /**
     * Copy the given point in the current one
     * @param {Point} point - the point to copy
     * @returns {Point} - the current point
     */
    copy(point) {
        this.proj.copy(point.proj);
        this.fiber = point.fiber;
        return this;
    }

}


/**
 * Tangent vector at the origin of X
 *
 * The vector is represented by its coordinates in the orthonormal basis (e_x, e_y, e_phi) where
 * - e_x is the direction of the x coordinate of H^2
 * - e_y is the direction of the y coordinate in H^2
 * - e_phi is the direction of the fiber
 * Note that there is no e_z component, as this one is always zero in the tangent space at the origin of H^2
 *
 * @class
 * @public
 */
class Vector extends Vector3 {


    /**
     * Apply to the H^2 component a rotation of angle alpha centered at the origin
     * @param {number} angle - the rotation angle
     * @returns {Vector} - the current point
     */
    rotateBy(angle) {
        let m = new Matrix3().set(
            Math.cos(angle), -Math.sin(angle), 0,
            Math.sin(angle), Math.cos(angle), 0,
            0, 0, 1,
        );
        this.applyMatrix3(m);
        return this;
    }

    /**
     * Apply the differential of the flip (x,y,z,w) -> (y,x,z,-w) to the current vector
     * @see Jupyter Notebook
     * @returns {Vector} - the current point
     */
    flip() {
        let m = new Matrix3().set(
            0, 1, 0,
            1, 0, 0,
            0, 0, -1,
        );
        this.applyMatrix3(m);
        return this;
    }

    /**
     * Apply the facing of a position to the current vector
     * @param {Position} position - the position giving the facing to apply
     * @returns {Vector} - the current vector
     */
    rotateByFacing(position) {
        let aux = new Matrix3().setFromMatrix4(position.facing);
        this.applyMatrix3(aux);
        return this;
    };
}

/**
 * Subgroup of isometries of X
 *
 * We record here the isometries given by the left action of X on itself
 *
 * @class
 * @public
 */
class Isometry {

    /**
     * Constructor
     * By default return the identity
     */
    constructor() {
        /**
         * @property {Point} - the image of the origin by the isometry
         */
        this.target = new Point()
    }

    /**
     * Set the data
     * We make the type of data quite generic to keep it geometry independent
     * @param {Array.<Point>} data - the data (an array with a single entry which is a point)
     */
    set(data) {
        this.target = data[0].clone();
        return this;
    }

    /**
     * Multiply the current isometry on the left by isom, i.e. isom * this
     * @param {Isometry} isom - the left isometry in the product
     * @returns {Isometry} - the current isometry
     */
    premultiply(isom) {
        // multiplication of the element in SL(2,R)
        this.target.proj.premultiply(isom.target.proj);

        // computing the new fiber component
        let aux = this.target.proj.clone();
        aux.translateFiberBy(-this.target.fiber - isom.target.fiber);
        this.target.fiber = this.target.fiber + isom.target.fiber + 2 * Math.atan2(aux.y, aux.x);

        return this;
    }

    /**
     * Multiply the current isometry on the right by isom, i.e. this * isom
     * @param {Isometry} isom - the right isometry in the product
     * @returns {Isometry} - the current isometry
     */
    multiply(isom) {
        // multiplication of the element in SL(2,R)
        this.target.proj.multiply(isom.target.proj);

        // computing the new fiber component
        let aux = this.target.proj.clone();
        aux.translateFiberBy(-this.target.fiber - isom.target.fiber);
        this.target.fiber = this.target.fiber + isom.target.fiber + 2 * Math.atan2(aux.y, aux.x);

        return this;
    };

    /**
     * Set the current isometry to the inverse of the given isometry.
     * @param {Isometry} isom - the isometry to inverse
     * @returns {Isometry} - the current isometry
     */
    getInverse(isom) {
        this.target.proj.getInverse(isom.target.proj);
        this.target.fiber = -isom.target.fiber;
        return this;
    }

    /**
     * Return a 4 dim vector of the form (x, y, z, w) where corresponding to the image of the origin
     * For a complete geometry independent code there should be
     * a way to standardize the way the object are passed to the shader
     * @todo Do we need to clone the point before returning it
     *
     * @returns {Vector4} - the isometry as a Vector4
     */
    toVector4() {
        return this.target.toVector4();
    }

    /**
     * Return an encoding of the isometry that can be passed to the shader
     * @returns {Vector4} - the "encoded" isometry
     */
    serialize() {
        return this.toVector4();
    }

    /**
     * Correct the point so that the H^2 component stays on the hyperboloid.
     * @returns {Isometry}
     */
    reduceError() {
        this.target.proj.reduceError();
        return this;
    }

    /**
     * Return a copy of the isometry
     * @returns {Isometry} - the copy of the isometry
     */
    clone() {
        return new Isometry(this.target.clone())
    }

    /**
     * Copy the given isometry in the current one
     * @param {Isometry} isom - the isometry to copy
     * @returns {Isometry} - the current isometry
     */
    copy(isom) {
        this.target.copy(isom.target);
        return this;
    }

}

export {
    SL2,
    Point,
    Vector,
    Isometry
}
