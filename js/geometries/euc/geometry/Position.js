import {Isometry} from "../../../core/geometry/Isometry.js";
import {Point} from "../../../core/geometry/Point.js";
import {Position} from "../../../core/geometry/Position.js";

Position.prototype.flowFromOrigin = function (v) {
    const point = new Point(v.x, v.y, v.z);
    this.boost.multiply(new Isometry().makeTranslation(point));
    this.quaternion.identity();
    return this;
}


export {
    Position
}