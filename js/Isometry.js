/*

    Module handling isometries in the given geometry

 */

import {
    Matrix4,
    Vector4
} from "./module/three.module.js";


function Isometry() {
    // In the euclidean geometry an isometry is just a 4x4 matrix.
    // By default the return isometry is the identity
    this.matrix = new Matrix4();
}

Isometry.prototype.set = function (data) {
    // set the data
    this.matrix = data[0].clone();
    return this;
};

Isometry.prototype.makeLeftTranslation = function (x, y, z) {
    // return the left translation by (x,y,z)
    // maybe not very useful for the Euclidean geometry, but definitely needed for Nil or Sol
    this.matrix.makeTranslation(x, y, z);
    return this;
};

Isometry.prototype.makeInvLeftTranslation = function (x, y, z) {
    // return the inverse of the left translation by (x,y,z)
    // maybe not very useful for the Euclidean geometry, but definitely needed for Nil or Sol
    this.matrix.makeTranslation(-x, -y, -z);
    return this;
};

Isometry.prototype.premultiply = function (isom) {
    // return the current isometry multiplied on the left by isom, i.e. isom * this
    this.matrix.premultiply(isom.matrix);
    return this;
};

Isometry.prototype.multiply = function (isom) {
    // return the current isometry multiplied on the left by isom, i.e. this * isom
    this.matrix.multiply(isom.matrix);
    return this;
};

Isometry.prototype.getInverse = function (isom) {
    // set the current isometry to the inverse of the passed isometry isom,
    this.matrix.getInverse(isom.matrix);
    return this;
};

Isometry.prototype.equals = function (isom) {
    // test equality of isometries (for debugging purpose mostly)
    return this.matrix.equals(isom.matrix);
};

Isometry.prototype.clone = function () {
    return new Isometry().set([this.matrix]);
};


/*

    Translating a point by an isometry

 */


Vector4.prototype.translateBy = function (isom) {
    return this.applyMatrix4(isom.matrix);
};


export {Isometry};
