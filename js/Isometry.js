/*

    Module handling isometries in the given geometry

 */

import {
    Matrix3,
    Matrix4,
    Vector3,
    Vector4
} from "./module/three.module.js";


Vector3.prototype.scaleBy = function (scalar) {
    // multiply the current vector by scalar
    this.set(
        scalar * this.x,
        scalar * this.y,
        scalar * this.z
    );
    return this;
};

Vector3.prototype.flip = function () {
    // apply a a "flip" (u1,u2,u3) -> (-u1, u3, u2) to a vector in the lie algebra of SL(2,R) in the hyperboloid model
    this.set(
        -this.x,
        this.z,
        this.y
    );
    return this;
};

Vector4.prototype.scaleBy = function (scalar) {
    // multiply the current vector by scalar
    this.set(
        scalar * this.x,
        scalar * this.y,
        scalar * this.z,
        scalar * this.w
    );
    return this;
};

/*

    Translating a point

 */

Vector4.prototype.translateBy = function(isom) {
    let aux = new Isometry().makeLeftTranslation(this.x, this.y, this.z, this.w);
    aux.premultiply(isom);
    return new Vector4(aux.phi, aux.point.x, aux.point.y, aux.point.z);
};



/**
 *
 * Point in H^2 seen as vector of R^3 in the hyperboloid model
 *
 **/

function H2Elt() {
    // by default return the origin
    this.coord = new Vector3(1, 0, 0);
}

H2Elt.prototype.rotateBy = function (alpha) {
    // Rotate the current point by an angle alpha
    let m = new Matrix3().set(
        1, 0, 0,
        0, Math.cos(alpha), -Math.sin(alpha),
        0, Math.sin(alpha), Math.cos(alpha)
    );
    this.coord.applyMatrix3(m);
    this.reduceError();
    return this;
};

H2Elt.prototype.translateBy = function (elt) {
    // translate the current point by the given element of SL(2,R)
    let mat = elt.toMatrix3();
    this.coord.applyMatrix3(mat);
    this.reduceError();
    return this;
};

H2Elt.prototype.flip = function () {
    // apply the "flip" (y1,y2,y3) -> (y1, -y3, -y2) to the given point
    this.coord.set(this.coord.x, -this.coord.z, -this.coord.y);
    this.reduceError();
    return this;
};

H2Elt.prototype.toSL2 = function () {
    // section from H2 to SL2 (see Jupyter notebook)
    let res = new SL2Elt();
    res.set(new Vector4(
        Math.sqrt(0.5 * this.coord.x + 0.5),
        0,
        -this.coord.z / Math.sqrt(2 * this.coord.x + 2),
        this.coord.y / Math.sqrt(2 * this.coord.x + 2)
    ));
    res.reduceError();
    return res;
};

H2Elt.prototype.reduceError = function () {
    // correct the error to make sure that the point lies on the hyperboloid
    let q = -Math.pow(this.coord.x, 2) + Math.pow(this.coord.y, 2) + Math.pow(this.coord.z, 2);
    this.coord.scaleBy(1 / Math.sqrt(-q));
    return this;
};

H2Elt.prototype.equals = function (elt) {
    // test equality of points (for debugging purpose mostly)
    return this.coord.equals(elt.coord);
};

H2Elt.prototype.clone = function () {
    // clone the point
    return new H2Elt().set(this.coord);
};


/**
 *
 * Element of SL(2,R) seen as elements of R^4 in the hyperboloid model (see Jupyter notebook for the isomorphism)
 *
 **/

function SL2Elt() {
    // by default return the origin (corresponding to the identity element)
    this.coord = new Vector4(1, 0, 0, 0);
}

SL2Elt.prototype.set = function (coord) {
    // set the data
    this.coord = coord.clone();
    return this;
};

SL2Elt.prototype.toMatrix3 = function () {
    // return the 3x3 Matrix corresponding to the isometry of H2 (in the hyperboloid model)
    // represented by the current element
    let aux1 = new Matrix4().set(
        this.coord.y, this.coord.x, this.coord.w, -this.coord.z,
        this.coord.z, this.coord.w, this.coord.x, -this.coord.y,
        this.coord.w, -this.coord.z, this.coord.y, this.coord.x,
        0, 0, 0, 0
    );
    let aux2 = new Matrix4().set(
        this.coord.y, -this.coord.z, -this.coord.w, 0,
        this.coord.x, this.coord.w, -this.coord.z, 0,
        this.coord.w, this.coord.x, -this.coord.y, 0,
        -this.coord.z, this.coord.y, this.coord.x, 0
    );
    let aux = aux1.multiply(aux2);
    return new Matrix3().setFromMatrix4(aux);
};

SL2Elt.prototype.toMatrix4 = function () {
    // return the 4x4 Matrix, corresponding to the current element, seen as an isometry of SL(2,R)
    return new Matrix4().set(
        this.coord.x, -this.coord.y, this.coord.z, this.coord.w,
        this.coord.y, this.coord.x, -this.coord.w, this.coord.z,
        this.coord.z, -this.coord.w, this.coord.x, this.coord.y,
        this.coord.w, this.coord.z, -this.coord.y, this.coord.x
    );
};

SL2Elt.prototype.premultiply = function (elt) {
    // return the current element of SL(2,R) multiplied on the left by isom, i.e. elt * this
    let m = elt.toMatrix4();
    this.coord.applyMatrix4(m);
    this.reduceError();
    return this;
};

SL2Elt.prototype.multiply = function (elt) {
    // return the current element of SL(2,R) multiplied on the left by isom, i.e. this * elt
    let m = this.toMatrix4();
    this.coord = elt.coord.clone().applyMatrix4(m);
    this.reduceError();
    return this;
};

SL2Elt.prototype.rotateBy = function (alpha) {
    // rotate the current element of SL(2,R) by the given angle alpha
    let m = new Matrix4().set(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, Math.cos(alpha), -Math.sin(alpha),
        0, 0, Math.sin(alpha), Math.cos(alpha)
    );
    this.coord.applyMatrix4(m);
    this.reduceError();
    return this;
};

SL2Elt.prototype.translateFiberBy = function (phi) {
    // translate the current element along the fiber by the given angle phi
    let m = new Matrix4(
        Math.cos(phi), -Math.sin(phi), 0, 0,
        Math.sin(phi), Math.cos(phi), 0, 0,
        0, 0, Math.cos(phi), Math.sin(phi),
        0, 0, -Math.sin(phi), Math.cos(phi)
    );
    this.coord.applyMatrix4(m);
    this.reduceError();
    return this;
};

SL2Elt.prototype.flip = function () {
    // apply the flip (see Jupyter notebook) to the current element
    let m = new Matrix4().set(
        1, 0, 0, 0,
        0, -1, 0, 0,
        0, 0, 0, 1,
        0, 0, 1, 0
    );
    this.coord.applyMatrix4(m);
    this.reduceError();
    return this;
};

H2Elt.prototype.reduceError = function () {
    // correct the error to make sure that the point lies on the hyperboloid
    let q = -Math.pow(this.coord.x, 2) - Math.pow(this.coord.y, 2) + Math.pow(this.coord.z, 2) + Math.pow(this.coord.w, 2);
    this.coord.scaleBy(1 / Math.sqrt(-q));
    return this;
};

SL2Elt.prototype.equals = function (elt) {
    // test equality of elements (for debugging purpose mostly)
    return this.coord.equals(elt.coord);
};

SL2Elt.prototype.clone = function () {
    // clone the element
    return new SL2Elt().set(this.coord);
};

/**
 *
 * Isometries
 * They represent points in the universal cover of SL(2,R) seen as isometries of this space
 *
 **/


function Isometry() {
    this.phi = 0; // angle in the fiber (vertical component)
    this.point = new H2Elt(); // point in H2
}

Isometry.prototype.set = function (data) {
    // set the data of the isometry
    // the first element in data is the angle in the fiber
    // the second element is the point of H2
    this.phi = data[0];
    this.point = data[1];
    return this;
};

Isometry.prototype.toSL2 = function () {
    // covering map (see Jupyter notebook)
    let res = this.point.toSL2();
    res.translateFiberBy(this.phi);
    return res;
};

Isometry.prototype.toVector4 = function() {
    // return a 4 dim vector of the form (phi, y1, y2, y3)
    // where (y1,y2,y3) are the coordinates of the underlying point of H2
    return new Vector4(this.phi, this.point.x, this.point.y, this.point.z);
};


Isometry.prototype.makeLeftTranslation = function (phi, x, y, z) {
    // return the "left translation" by (phi,x,y,z)
    // maybe not very useful for the Euclidean geometry, but definitely needed for Nil or Sol
    this.phi = phi;
    this.point.set(x, y, z);
    return this;
};

Isometry.prototype.makeInvLeftTranslation = function (phi, x, y, z) {
    // return the inverse of the "left translation" by (phi,x,y,z)
    // maybe not very useful for the Euclidean geometry, but definitely needed for Nil or Sol
    this.phi = phi;
    this.point.set(x, y, z);
    this.getInverse();
    return this;
};

Isometry.prototype.premultiply = function (isom) {
    // return the current isometry multiplied on the left by isom, i.e. isom * this
    let aux1 = isom.toSL2();
    let aux2 = this.toSL2();
    this.point.translateBy(aux1);
    aux2.premultiply(aux1);
    aux2.translateFiberBy(-this.phi - isom.phi);
    this.phi = this.phi + isom.phi + Math.atan2(aux2.y, aux2.x);
    return this;
};

Isometry.prototype.multiply = function (isom) {
    // return the current isometry multiplied on the left by isom, i.e. this * isom
    let aux1 = this.toSL2();
    let aux2 = isom.toSL2();
    this.point = isom.point.clone().translateBy(aux1);
    aux2.premultiply(aux1);
    aux2.translateFiberBy(-this.phi - isom.phi);
    this.phi = this.phi + isom.phi + Math.atan2(aux2.y, aux2.x);
    return this;
};

Isometry.prototype.getInverse = function () {
    // set the current isometry to the inverse of the passed isometry isom,
    this.point.rotateBy(Math.PI - 2 * this.phi);
    this.phi = -this.phi;
    return this;
};

Isometry.prototype.equals = function (isom) {
    // test equality of isometries (for debugging purpose mostly)
    return (this.phi === isom.phi) && (this.point.equals(isom.point));
};

Isometry.prototype.clone = function () {
    return new Isometry().set([this.phi, this.point]);
};

Isometry.prototype.reduceError = function () {
    this.point.reduceError();
    return this;
};

export {Isometry, H2Elt};
