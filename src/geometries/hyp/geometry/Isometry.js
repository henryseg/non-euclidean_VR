import {
    Matrix4,
    Vector3,
    Vector4,
} from "three";

import * as Utils from "./Utils.js";
import {Isometry} from "../../../core/geometry/Isometry.js";
import {Vector} from "../../../core/geometry/Vector.js";


Isometry.prototype.build = function () {
    this.matrix = new Matrix4();
}

Isometry.prototype.identity = function () {
    this.matrix.identity();
}

Isometry.prototype.reduceError = function () {
    // Hyperbolic Gram-Schmidt
    const col0 = new Vector4(1, 0, 0, 0).applyMatrix4(this.matrix);
    const col1 = new Vector4(0, 1, 0, 0).applyMatrix4(this.matrix);
    const col2 = new Vector4(0, 0, 1, 0).applyMatrix4(this.matrix);
    const col3 = new Vector4(0, 0, 0, 1).applyMatrix4(this.matrix);

    col0.hypNormalize();

    const aux10 = col0.clone().multiplyScalar(col0.hypDot(col1));
    col1.sub(aux10).hypNormalize();

    const aux20 = col0.clone().multiplyScalar(col0.hypDot(col2));
    const aux21 = col1.clone().multiplyScalar(col1.hypDot(col2));
    col2.sub(aux20).sub(aux21).hypNormalize();

    const aux30 = col0.clone().multiplyScalar(col0.hypDot(col3));
    const aux31 = col1.clone().multiplyScalar(col1.hypDot(col3));
    const aux32 = col2.clone().multiplyScalar(col2.hypDot(col3));
    col3.sub(aux30).sub(aux31).sub(aux32).hypNormalize();

    this.matrix.set(
        col0.x, col1.x, col2.x, col3.x,
        col0.y, col1.y, col2.y, col3.y,
        col0.z, col1.z, col2.z, col3.z,
        col0.w, col1.w, col2.w, col3.w
    );
    return this;
};

Isometry.prototype.multiply = function (isom) {
    this.matrix.multiply(isom.matrix);
    this.reduceError();
    return this;
};

Isometry.prototype.premultiply = function (isom) {
    this.matrix.premultiply(isom.matrix);
    this.reduceError();
    return this;
};

Isometry.prototype.invert = function () {
    this.matrix.invert();
    this.reduceError();
    return this;
};

Isometry.prototype.makeTranslation = function (point) {

    this.matrix.identity();

    const [x, y, z, w] = point.coords.toArray();
    const u = new Vector3(x, y, z);
    const c1 = u.length(); //sinh


    if (c1 === 0) {
        return this;
    }

    const c2 = w - 1 //cosh
    u.normalize();

    const m = new Matrix4().set(
        0, 0, 0, u.x,
        0, 0, 0, u.y,
        0, 0, 0, u.z,
        u.x, u.y, u.z, 0);

    const m2 = m.clone().multiply(m);

    m.multiplyScalar(c1);
    this.matrix.add(m);

    m2.multiplyScalar(c2);
    this.matrix.add(m2);

    return this;


};

Isometry.prototype.makeInvTranslation = function (point) {
    this.makeTranslation(point);
    this.invert();
    return this;

};


Isometry.prototype.makeTranslationFromDir = function (vec) {

    this.matrix.identity();
    const t = vec.length();

    if (t === 0) {
        return this;
    }
    const u = vec.clone().normalize();

    const c1 = Math.sinh(t);
    const c2 = Math.cosh(t) - 1.;

    const m = new Matrix4().set(
        0, 0, 0, u.x,
        0, 0, 0, u.y,
        0, 0, 0, u.z,
        u.x, u.y, u.z, 0);

    const m2 = m.clone().multiply(m);

    m.multiplyScalar(c1);
    this.matrix.add(m);

    m2.multiplyScalar(c2);

    this.matrix.add(m2);

    return this;
};

/***
 * Return the isometry translating the origin by a distance t along the geodesic directed by e_z = (0, 0, 1)
 * @param {number} t - the translation distance
 * @return {Isometry}
 */
Isometry.prototype.makeTranslationZ = function (t) {
    const c = Math.cosh(t);
    const s = Math.sin(t);
    this.matrix.set(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, c, s,
        0, 0, s, c
    );
    return this;
}


Isometry.prototype.diffExpMap = function (m) {
    const tangentPosition = new Vector().setFromMatrixPosition(m);
    const aux = m.clone().setPosition(0, 0, 0);
    this.makeTranslationFromDir(tangentPosition);
    this.matrix.multiply(aux);
    return this;
}


Isometry.prototype.equals = function (isom) {
    return this.matrix.equals(isom.matrix);
};

Isometry.prototype.clone = function () {
    let res = new Isometry();
    res.matrix.copy(this.matrix);
    return res;
};

Isometry.prototype.copy = function (isom) {
    this.matrix.copy(isom.matrix);
    return this;
};

export {
    Isometry
}
