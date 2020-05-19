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




//CHANGED THIS
//this function takes v in the tangent space and returns the isometry which translates by |v| in the direction of v
//for Euclidean geometry this is the same as the above; but in general is not.
// do we want to keep both of these?
Isometry.prototype.translateByVector = function (v) {

    let matrix = new Matrix4().identity();
    let len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

    if (len != 0) {
        var c1 = Math.sin(len);
        var c2 = 1 - Math.cos(len);
        let dx = v.x / len;
        let dy = v.y / len;
        let dz = v.z / len;
        var m = new Matrix4().set(
            0, 0, 0, dx,
            0, 0, 0, dy,
            0, 0, 0, dz,
            -dx, -dy, -dz, 0.0);
        var m2 = m.clone().multiply(m);
        m.multiplyScalar(c1);
        m2.multiplyScalar(c2);
        matrix.add(m);
        matrix.add(m2);
    }
    this.matrix = matrix;

    return this;
}


//CHANGED THIS
Isometry.prototype.makeLeftTranslation = function (v) {

    this.translateByVector(v);
    return this;
};

//CHANGED THIS
Isometry.prototype.makeInvLeftTranslation = function (v) {

    this.translateByVector(v.multiplyScalar(-1));
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


export {
    Isometry
};
