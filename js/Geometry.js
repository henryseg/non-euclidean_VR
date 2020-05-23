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
     * @todo Check if this method is really needed
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
     * @todo Check if this method is really needed
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
 * Extends the class Vector4 of Three.js
 * We represents these points as a 4-dim vector (x,y,z,w) where
 * - (x,y,z) are the coordinates of its projection onto H2
 * - w is the angle in the fiber
 *
 * The points of H^2 are meant in the hyperboloid model, i.e. x^2 + y^2 - z^2 = -1 and z > 0.
 * The origin is (0,0,1,0)
 *
 * @class
 * @public
 */
class Point extends Vector4 {

    /**
     * Create a new point whose coordinates corresponds to the origin
     */
    constructor() {
        super();
        this.set(0, 0, 1, 0)
    }

    /**
     * Apply to the H^2 component a rotation of angle alpha centered at the origin
     * @param {number} angle - the rotation angle
     * @returns {Point} - the current point
     */
    rotateBy(angle) {
        let m = new Matrix4().set(
            Math.cos(angle), -Math.sin(angle), 0, 0,
            Math.sin(angle), Math.cos(angle), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
            )
        ;
        this.applyMatrix4(m);
        this.reduceError();
        return this;
    }

    /**
     * Apply the flip (x,y,z,w) -> (y,x,z,-w) to the current point
     * @see Jupyter Notebook
     * @returns {Point} - the current point
     */
    flip() {
        let m = new Matrix4().set(
            0, 1, 0, 0,
            1, 0, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, -1
        );
        this.applyMatrix4(m);
        this.reduceError();
        return this;
    }

    /**
     * Covering map from X to SL(2,R)
     * @returns {SL2} - the image of the point in SL(2,R)
     */
    toSL2() {
        // image of the section from H^2 to SL(2,R)
        let res = new SL2().set(
            Math.sqrt(0.5 * this.z + 0.5),
            0,
            this.x / Math.sqrt(2. * this.z + 2.),
            this.y / Math.sqrt(2. * this.z + 2.),
        );
        // translate the section along the fiber
        res.translateFiberBy(this.w);
        // return the result
        return res;
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
     * @returns {Point} - the translaed point
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
        let q = Math.pow(this.x, 2) + Math.pow(this.y, 2) - Math.pow(this.z, 2);
        this.x = this.x / Math.sqrt(-q);
        this.y = this.y / Math.sqrt(-q);
        this.z = this.z / Math.sqrt(-q);
        return this;
    }
}

/**
 * @constant {Point} ORIGIN - Origin of the space
 * @todo Since the constructor of Point return the origin by default, this constant is maybe not needed
 */
const ORIGIN = new Point();

/**
 * Tangent vector at the origin of X
 *
 * The vector is represented by its coordinates in the orthonormal basis (e_x, e_y, e_w) where
 * - e_x is the direction of the x coordinate of H^2
 * - e_y is the direction of the y coordinate in H^2
 * - e_w is the direction of the fiber
 * Note that there is no e_z component, as this one is always zero in the tangent space at the origin of H^2
 *
 * @class
 * @public
 */
class Vector extends Vector3 {

    /**
     * Constructor
     */
    constructor() {
        super();
    }

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
    }

    /**
     * Set the current object to the isometry moving the origin to the point (x,y,z,w)
     * @param {number} x - the first coordinates of the point to achieve
     * @param {number} y - the second coordinates of the point to achieve
     * @param {number} z - the third coordinates of the point to achieve
     * @param {number} w - the last coordinates of the point to achieve
     * @returns {Isometry} - the current isometry
     */
    makeTranslation(x, y, z, w) {
        this.target.set(x, y, z, w);
        return this;
    }

    /**
     * Set the current object to the isometry moving the point (x,y,z,w) to the origin
     * @param {number} x - the first coordinates of the point
     * @param {number} y - the second coordinates of the point
     * @param {number} z - the third coordinates of the point
     * @param {number} w - the last coordinates of the point
     * @returns {Isometry} - the current isometry
     */
    makeInvTranslation(x, y, z, w) {
        let isom = new Isometry().makeTranslation(x, y, z, w);
        this.getInverse(isom);
        return this;
    }

    /**
     * Multiply the current isometry on the left by isom, i.e. isom * this
     * @param {Isometry} isom - the left isometry in the product
     * @returns {Isometry} - the current isometry
     */
    premultiply(isom) {
        let aux1SL = isom.target.toSL2();
        let aux2SL = this.target.toSL2();

        aux2SL.premultiply(aux1SL);
        aux2SL.translateFiberBy(-this.target.w - isom.target.w);
        let point = aux2SL.toH2();

        // update the data
        this.target.set(
            point.x,
            point.y,
            point.z,
            this.target.w + isom.target.w + 2 * Math.atan2(aux2SL.y, aux2SL.x)
        );

        this.target.reduceError();
        return this;
    }

    /**
     * Multiply the current isometry on the right by isom, i.e. this * isom
     * @param {Isometry} isom - the right isometry in the product
     * @returns {Isometry} - the current isometry
     */
    multiply(isom) {
        let aux1SL = this.target.toSL2();
        let aux2SL = isom.target.toSL2();

        aux2SL.premultiply(aux1SL);
        aux2SL.translateFiberBy(-this.target.w - isom.target.w);
        let h2_point = aux2SL.toH2();

        // update the data
        this.target.set(
            h2_point.x,
            h2_point.y,
            h2_point.z,
            this.target.w + isom.target.w + 2 * Math.atan2(aux2SL.y, aux2SL.x)
        );

        this.target.reduceError();
        return this;
    };

    /**
     * Set the current isometry to the inverse of the given isometry.
     * @param {Isometry} isom - the isometry to inverse
     * @returns {Isometry}  - the inverse isometry
     */
    getInverse(isom) {
        // rotate the H^2 component of the isometry
        let r4 = new Matrix4().makeRotationAxis(
            new Vector3(0, 0, 1),
            Math.PI - isom.w
        );
        let r3 = new Matrix3().setFromMatrix4(r4);
        let h2_point = new Vector3().set(
            isom.target.x,
            isom.target.y,
            isom.target.z
        );
        h2_point.applyMatrix3(r3);

        // update the H^2 component and flip the fiber component
        this.target.set(
            h2_point.x,
            h2_point.y,
            h2_point.z,
            -isom.w
        );

        this.target.reduceError();
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
        return this.target.clone();
    }

    /**
     * Return an encoding of the isometry that can be passed to the shader
     * @returns {Vector4} - the "encoded" isometry
     */
    serialize() {
        return this.toVector4()
    }

    /**
     * Return a copy of the isometry
     * @returns {Isometry} - the copy of the isometry
     */
    clone() {
        return new Isometry(this.target.clone())
    }

}

export {
    Point,
    Vector,
    Isometry,
    ORIGIN
}
