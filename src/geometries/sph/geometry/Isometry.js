import {Isometry} from "../../../core/geometry/Isometry.js";
import {Matrix4, Vector3, Vector4, Quaternion} from "three";


Isometry.prototype.build = function () {
    this.matrix = new Matrix4();
}

Isometry.prototype.identity = function () {
    this.matrix.identity();
}

Isometry.prototype.reduceError = function () {
    return this;
};

Isometry.prototype.multiply = function (isom) {
    this.matrix.multiply(isom.matrix);
    return this;
};

Isometry.prototype.premultiply = function (isom) {
    this.matrix.premultiply(isom.matrix);
    return this;
};

Isometry.prototype.invert = function () {
    this.matrix.invert();
    return this;
};

Isometry.prototype.makeTranslation = function (point) {
    this.matrix.identity();
    const [x, y, z, w] = point.coords.toArray();
    const u = new Vector3(x, y, z);
    const c1 = u.length();

    if (c1 === 0) {
        return this;
    }

    const c2 = 1 - w;
    u.normalize();
    const m = new Matrix4().set(
        0, 0, 0, u.x,
        0, 0, 0, u.y,
        0, 0, 0, u.z,
        -u.x, -u.y, -u.z, 0
    );
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
    const c1 = Math.sin(t);
    const c2 = 1 - Math.cos(t);
    const m = new Matrix4().set(
        0, 0, 0, u.x,
        0, 0, 0, u.y,
        0, 0, 0, u.z,
        -u.x, -u.y, -u.z, 0
    );
    const m2 = m.clone().multiply(m);
    m.multiplyScalar(c1);
    this.matrix.add(m);
    m2.multiplyScalar(c2);
    this.matrix.add(m2);

    return this;
};

/**
 * Update the current isometry with the one sending the vector e_z at the origin to the given vector at the given point
 * It is assumed that `vector` is a vector in the tangent space of the sphere at `point`
 * @param {Point} point - the image of the origin
 * @param {Vector4} vector - the image of e_z.
 * @returns {Isometry} - the current isometry
 */
Isometry.prototype.makeTranslationWithDir = function (point, vector) {
    const transInv = new Isometry().makeInvTranslation(point);
    const trans = new Isometry().makeTranslation(point);

    const aux = vector.clone().applyMatrix4(transInv.matrix);
    const vAtOrigin = new Vector3(aux.x, aux.y, aux.z).normalize();
    const ez = new Vector3(0, 0, 1);
    const q = new Quaternion().setFromUnitVectors(ez, vAtOrigin);
    const rotMatrix = new Matrix4().makeRotationFromQuaternion(q);
    this.matrix.copy(trans.matrix).multiply(rotMatrix);
    return this;
}

Isometry.prototype.equals = function (isom) {
    return this.matrix.equals(isom.matrix);
};

Isometry.prototype.copy = function (isom) {
    this.matrix.copy(isom.matrix);
    return this;
};


export {
    Isometry
}