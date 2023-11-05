import {Point} from "../../../core/geometry/Point.js";
import {Vector4} from "three";


Point.prototype.build = function () {
    if (arguments.length === 0) {
        this.coords = new Vector4(0, 0, 0, 1);
    } else {
        this.coords = new Vector4(...arguments);
    }
    this.coords.normalize();
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


Point.prototype.copy = function (point) {
    this.coords.copy(point.coords);
    return this;
};


export {
    Point
}