import {Vector4} from "three";
import {Point} from "../../../core/geometry/Point.js";


Point.prototype.build = function () {
    if (arguments.length === 0) {
        this.coords = new Vector4(0, 0, 0, 1);
    } else {
        this.coords = new Vector4(...arguments);
    }
};

Point.prototype.set = function() {
    this.coords.set(arguments[0], arguments[1], arguments[2], 1);
    return this;
}

Point.prototype.applyIsometry = function (isom) {
    this.coords.applyMatrix4(isom.matrix)
    return this;
};

Point.prototype.equals = function (point) {
    return this.coords.equals(point.coords)
};


Point.prototype.reduceError = function () {
    return this;
}


Point.prototype.copy = function (point) {
    this.coords.copy(point.coords);
    return this;
};

export {
    Point
}