import {Matrix4} from "../../../lib/threejs/build/three.module.js";

import {Isometry} from "../../../core/geometry/Isometry.js";

Isometry.prototype.build = function () {
    this.matrix = new Matrix4();
}

Isometry.prototype.identity = function () {
    this.matrix.identity();
    return this;
}

Isometry.prototype.reduceError = function () {
    return this;
}

Isometry.prototype.multiply = function (isom) {
    this.matrix.multiply(isom.matrix);
    return this;
}

Isometry.prototype.premultiply = function (isom) {
    this.matrix.premultiply(isom.matrix);
    return this;
}

Isometry.prototype.invert = function () {
    this.matrix.invert();
    return this;
}

Isometry.prototype.makeTranslation = function (point) {
    const [x, y, z,] = point.coords.toArray();
    this.matrix.set(
        Math.exp(z), 0, 0, x,
        0, Math.exp(-z), 0, y,
        0, 0, 1, z,
        0, 0, 0, 1,
    )
    return this;
};

Isometry.prototype.makeInvTranslation = function (point) {
    const [x, y, z,] = point.coords.toArray();
    this.matrix.set(
        Math.exp(-z), 0, 0, -Math.exp(-z) * x,
        0, Math.exp(z), 0, -Math.exp(z) * y,
        0, 0, 1, -z,
        0, 0, 0, 1,
    )
    return this;
};

Isometry.prototype.makeFlip = function () {
    this.matrix.set(
        0, 1, 0, 0,
        1, 0, 0, 0,
        0, 0, -1, 0,
        0, 0, 0, 1
    );
    return this;
}

Isometry.prototype.makeReflectionX = function () {
    this.matrix.set(
        -1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
    return this;
}

Isometry.prototype.makeReflectionY = function () {
    this.matrix.set(
        1, 0, 0, 0,
        0, -1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
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

