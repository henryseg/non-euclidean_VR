import {Point} from "../abstract/Point.js";
import {Vector4} from "../../lib/three.module.js";


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


export {
    Point
}