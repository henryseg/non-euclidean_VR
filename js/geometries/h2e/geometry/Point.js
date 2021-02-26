import {Vector4} from "../../../lib/three.module.js";

import {Point} from "../../../core/geometry/Point.js";

Point.prototype.build = function () {
    if (arguments.length === 0) {
        this.coords = new Vector4(0, 0, 1, 0);
    } else {
        this.coords = new Vector4(...arguments);
    }
};

Point.prototype.set = function(){
    this.coords.set(...arguments);
    return this;
}

Point.prototype.applyIsometry = function (isom) {
    this.coords.applyMatrix4(isom.matrix);
    this.coords.setW(this.coords.w + isom.shift);
    return this;
};

Point.prototype.reduceError = function () {
    return this;
}

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


