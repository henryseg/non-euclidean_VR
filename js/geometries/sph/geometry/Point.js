import {Point} from "../../../core/geometry/Point.js";
import {Vector4} from "../../../lib/three.module.js";


Point.prototype.build = function () {
    if (arguments.length === 0) {
        this.coords = new Vector4(0, 0, 0, 1);
    } else {
        this.coords = new Vector4(...arguments);
    }
};

Point.prototype.reduceError = function () {
    this.coords.normalize();
    return this;
};

Point.prototype.applyIsometry = function (isom) {
    this.coords.applyMatrix4(isom.matrix);
    this.reduceError();
    return this;
};

Point.prototype.equals = function (point) {
    return this.coords.equals(point.coords)
};

Point.prototype.clone = function () {
    let res = new Point();
    res.coords.copy(this.coords);
    return res;
};

Point.prototype.copy = function (point) {
    this.coords.copy(point.coords);
    return this;
};


export {
    Point
}