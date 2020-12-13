import {Position} from "../abstract/Position.js";
import {Quaternion} from "../../lib/three.module.js";

Position.prototype.flowFromOrigin = function (v) {
    this.boost.makeTranslationFromDir(v);
    this.quaternion.identity();
    return this;
}

export {
    Position
}
