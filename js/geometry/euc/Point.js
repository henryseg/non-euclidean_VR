import {Point} from "../abstract/Point.js";
import {Vector4} from "../../lib/three.module.js";


Point.prototype.build = function () {
    if (arguments.length === 0) {
        this.coords = new Vector4(0, 0, 0, 1);
    } else {
        this.coords = new Vector4(...arguments);
    }

};

Point.prototype.set = function (data) {
    //console.log("data set", data[0]);
    this.coords.copy(data[0]);
    return this;
};

Point.prototype.applyIsometry = function (isom) {
    this.coords.applyMatrix4(isom.matrix)
    return this;
};

Point.prototype.equals = function (point) {
    return this.coords.equals(point.coords)
};

Point.prototype.clone = function () {
    let res = new Point()
    res.set([this.coords.clone()]);
    return res;
};

Point.prototype.copy = function (point) {
    this.coords.copy(point.coords);
    return this;
};

Point.prototype.toGLSL = function () {
    return `Point(${this.coords.toGLSL()})`;
}


export {
    Point
}