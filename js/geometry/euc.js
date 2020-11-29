/**
 * @module EuclideanGeometry
 *
 * @description
 * Extension of the abstract geometry modeule for the euclidean space.
 * Overload all the geometry dependend method in the Abstract geometry module.
 */

import {
    Matrix4,
    Vector4,
} from "../lib/three.module.js"

import {
    Isometry,
    Point,
    Position,
} from "./abstract.js"


/**
 * @const {string}
 * @default Full name of the geometry
 */
const name = 'Euclidean space';

/**
 * @const {string}
 * @default Path to the geometry dependent part of the shader
 * @todo The path is relative to the file 'thurston.js'. Look at good practices for handling paths
 */
const shader = 'shaders/geometry/euc.glsl';


/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.build = function () {
    this.matrix = new Matrix4();
}

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.set = function (data) {
    this.matrix = data[0].clone();
    return this;
};

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.reduceError = function () {
    return this;
};

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.multiply = function (isom) {
    this.matrix.multiply(isom.matrix);
    return this;
};

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.premultiply = function (isom) {
    this.matrix.premultiply(isom.matrix);
    return this;
};

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.getInverse = function (isom) {
    this.matrix.getInverse(isom.matrix);
    return this;
};

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.makeTranslation = function (point) {
    const [x, y, z,] = point.coords.toArray();
    this.matrix.set(
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1,
    )
    return this;
};

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.makeInvTranslation = function (point) {
    [x, y, z,] = point.coords;
    this.matrix.set(
        1, 0, 0, -x,
        0, 1, 0, -y,
        0, 0, 1, -z,
        0, 0, 0, 1,
    )
    return this;
};


/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.equals = function (isom) {
    return this.matrix.equals(this.isom);
};

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.clone = function () {
    let res = new Isometry();
    res.set([this.matrix.clone()]);
    return res;
};

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.copy = function (isom) {
    this.matrix.copy(isom.matrix);
    return this;
};

/**
 * Euclidean implementation of the abstract method
 */
Isometry.prototype.toGLSL = function () {
    return `Isometry(${this.matrix.toGLSL()})`;
}


/**
 * Euclidean implementation of the abstract method
 */
Point.prototype.build = function () {
    if (arguments.length === 0) {
        this.coords = new Vector4(0, 0, 0, 1);
    } else {
        this.coords = new Vector4(...arguments);
    }

};

/**
 * Euclidean implementation of the abstract method
 */
Point.prototype.set = function (data) {
    //console.log("data set", data[0]);
    this.coords.copy(data[0]);
    return this;
};

/**
 * Euclidean implementation of the abstract method
 */
Point.prototype.applyIsometry = function (isom) {
    this.coords.applyMatrix4(isom.matrix)
    return this;
};


/**
 * Euclidean implementation of the abstract method
 */
Point.prototype.equals = function (point) {
    return this.coords.equals(point.coords)
};

/**
 * Euclidean implementation of the abstract method
 */
Point.prototype.clone = function () {
    let res = new Point()
    res.set([this.coords.clone()]);
    return res;
};

/**
 * Euclidean implementation of the abstract method
 */
Point.prototype.copy = function (point) {
    this.coords.copy(point.coords);
    return this;
};

/**
 * Euclidean implementation of the abstract method
 */
Point.prototype.toGLSL = function () {
    return `Point(${this.coords.toGLSL()})`;
}

/**
 * Euclidean implementation of the abstract method
 */
Position.prototype.flow = function (v) {
    const dir = v.clone().applyFacing(this);
    const point = new Point().set([new Vector4(dir.x, dir.y, dir.z, 1)]);
    this.boost.multiply(new Isometry().makeTranslation(point));
    return this;
}

export {
    name,
    shader,
    Isometry,
    Point,
    Position,
}

export {
    Vector,
    Teleport,
    DiscreteSubgroup,
    RelPosition
} from "./abstract.js";
