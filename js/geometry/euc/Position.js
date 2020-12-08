import {Isometry} from "../abstract/Isometry.js";
import {Point} from "../abstract/Point.js";
import {Position} from "../abstract/Position.js";
import {Quaternion} from "../../lib/three.module.js";

Position.prototype.flowFromOrigin = function (v) {
    const point = new Point(v.x, v.y, v.z);
    this.boost.multiply(new Isometry().makeTranslation(point));
    this.quaternion = new Quaternion();
    return this;
}


export {
    Position
}