import {
    Matrix4,Vector2
} from "three";

import {
    Isometry
} from "../../../core/geometry/Isometry.js";

Isometry.prototype.build = function () {
    this.matrix = new Matrix4();
    this.shift = 0;
}

Isometry.prototype.identity = function () {
    this.matrix.identity();
    this.shift = 0;
    return this;
}

Isometry.prototype.reduceError = function () {}

Isometry.prototype.multiply = function (isom) {
    this.matrix.multiply(isom.matrix);
    const coeff = this.matrix.elements[this.matrix.elements.length - 1];
    this.shift = this.shift + isom.shift;
    return this;
}

Isometry.prototype.premultiply = function (isom) {
    this.matrix.premultiply(isom.matrix);
    const coeff = isom.matrix.elements[isom.matrix.elements.length - 1];
    this.shift = isom.shift + coeff * this.shift;
    return this;
}

Isometry.prototype.invert = function () {
    this.matrix.invert;
    const coeff = this.matrix.elements[this.matrix.elements.length - 1];
    this.shift = -coeff * this.shift;

    return this;
}



Isometry.prototype.makeTranslationFromDir = function (vec) {

    var len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);

    this.shift = vec.z;

    this.matrix.identity();

    if (len !== 0) {
        const c1 = Math.sin(len);
        const c2 = 1 - Math.cos(len);

        const dx = vec.x / len;
        const dy = vec.y / len;
        const m = new Matrix4().set(
            0, 0, dx, 0,
            0, 0, dy, 0,
            -dx, -dy, 0, 0,
            0, 0, 0, 0.0);
        const m2 = m.clone().multiply(m);
        m.multiplyScalar(c1);
        m2.multiplyScalar(c2);
        this.matrix.add(m);
        this.matrix.add(m2);

    }

    return this;
}




Isometry.prototype.makeTranslation = function (point) {
    const [x, y, z, w] = point.coords.toArray();

    const u = new Vector2(x, y);
    const c1 = u.length();

    this.shift = w;
    this.matrix.identity();

    if (c1 === 0) {
        return this;
    }

    const c2 = 1 - z;
    u.normalize();

    const m = new Matrix4().set(
        0, 0, u.x, 0,
        0, 0, u.y, 0,
        -u.x, -u.y, 0, 0,
        0, 0, 0, 0.0);

    const m2 = new Matrix4().copy(m).multiply(m);
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




Isometry.prototype.equals = function (isom) {
    return this.matrix.equals(isom.matrix) && this.shift === isom.shift;
};

Isometry.prototype.clone = function () {
    let res = new Isometry();
    res.matrix.copy(this.matrix);
    res.shift = this.shift;
    return res;
};

Isometry.prototype.copy = function (isom) {
    this.matrix.copy(isom.matrix);
    this.shift = isom.shift;
    return this;
};



export {
    Isometry
}
