import {Matrix4, Vector2, Vector4} from "three";

import {Isometry} from "../../../core/geometry/Isometry.js";

Isometry.prototype.build = function () {
    this.matrix = new Matrix4();
    this.shift = 0;
}

Isometry.prototype.identity = function () {
    this.matrix.identity();
    this.shift = 0;
    return this;
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

    col3.normalize();
    this.matrix.set(
        col0.x, col1.x, col2.x, col3.x,
        col0.y, col1.y, col2.y, col3.y,
        col0.z, col1.z, col2.z, col3.z,
        col0.w, col1.w, col2.w, col3.w
    );
    return this;
}

Isometry.prototype.multiply = function (isom) {
    const coeff = this.matrix.elements[this.matrix.elements.length - 1];
    this.matrix.multiply(isom.matrix);
    this.shift = this.shift + coeff * isom.shift;
    return this;
}

Isometry.prototype.premultiply = function (isom) {
    const coeff = isom.matrix.elements[isom.matrix.elements.length - 1];
    this.matrix.premultiply(isom.matrix);
    this.shift = isom.shift + coeff * this.shift;
    return this;
}

Isometry.prototype.invert = function () {
    this.matrix.invert();
    const coeff = this.matrix.elements[this.matrix.elements.length - 1];
    this.shift = -coeff * this.shift;
    return this;
}

Isometry.prototype.makeTranslation = function (point) {
    const [x, y, z, w] = point.coords.toArray();
    this.matrix.identity();
    this.shift = w;
    const u = new Vector2(x, y);
    const c1 = u.length();

    if (c1 === 0) {
        return this;
    }
    const c2 = z - 1;
    u.normalize();

    const m = new Matrix4().set(
        0, 0, u.x, 0,
        0, 0, u.y, 0,
        u.x, u.y, 0, 0,
        0, 0, 0, 0
    );
    const m2 = m.clone().multiply(m);
    m.multiplyScalar(c1);
    m2.multiplyScalar(c2);
    this.matrix.add(m);
    this.matrix.add(m2);

    return this;
}

Isometry.prototype.makeInvTranslation = function (point) {
    this.makeTranslation(point);
    this.invert();
    return this;
}

Isometry.prototype.makeTranslationFromDir = function (vec) {
    const [x, y, z] = vec.toArray();
    this.matrix.identity();
    this.shift = z;
    const u = new Vector2(x, y);
    const s = u.length();

    if (s === 0) {
        return this;
    }

    const c1 = Math.sinh(s);
    const c2 = Math.cosh(s) - 1;
    u.normalize();

    const m = new Matrix4().set(
        0, 0, u.x, 0,
        0, 0, u.y, 0,
        u.x, u.y, 0, 0,
        0, 0, 0, 0
    );
    const m2 = m.clone().multiply(m);

    m.multiplyScalar(c1);
    this.matrix.add(m);

    m2.multiplyScalar(c2);
    this.matrix.add(m2);

    return this;
}

Isometry.prototype.equals = function (isom) {
    return this.matrix.equals(isom.matrix) && this.shift === isom.shift;
}

Isometry.prototype.clone = function () {
    const res = new Isometry();
    res.matrix.copy(this.matrix);
    res.shift = this.shift;
    return res;
}

Isometry.prototype.copy = function (isom) {
    this.matrix.copy(isom.matrix);
    this.shift = isom.shift;
    return this;
}

export {
    Isometry
}