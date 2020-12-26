import {Isometry} from "../../../core/geometry/Isometry.js";
import {Point} from "../../../core/geometry/Point.js";
import {Position} from "../../../core/geometry/Position.js";
import {Quaternion, Vector3} from "../../../lib/three.module.js";

const ex = new Vector3(1, 0, 0);
const ey = new Vector3(0, 1, 0);
const ez = new Vector3(0, 0, 1);


Position.prototype.flowFromOrigin = function (v) {
    // length of v
    const t = v.length();

    // if v is the zero vector, we are just not moving !
    if (t === 0) {
        this.boost.identity();
        this.quaternion.identity();
        return this;
    }

    // normalized version of v
    const u = v.clone().normalize();
    // cylindrical coordinates of u
    const c = u.z;
    const a = Math.sqrt(1 - c * c);
    let alpha = 0;
    if (a !== 0) {
        alpha = Math.atan2(u.y, u.x);
    }


    // point reached after flowing
    const target = new Point();
    if (c === 0) {
        target.set(v.x, v.y, v.z);
    } else {
        target.set(
            2 * (a / c) * Math.sin(0.5 * c * t) * Math.cos(0.5 * c * t + alpha),
            2 * (a / c) * Math.sin(0.5 * c * t) * Math.sin(0.5 * c * t + alpha),
            c * t + 0.5 * (a / c) * (a / c) * (c * t - Math.sin(c * t))
        )
    }
    // update the translation part of the position
    this.boost.makeTranslation(target);

    // parallel transport
    const q1 = new Quaternion().setFromAxisAngle(ez, c * t);
    const q2 = new Quaternion().setFromAxisAngle(ex, -0.5 * c * t);
    const qr = new Quaternion().setFromAxisAngle(ez, alpha);
    /** @todo This computation can be simplified : not going back and forth between angle and their sin/cos */
    const qp = new Quaternion().setFromAxisAngle(ey, -Math.atan2(c, a));

    this.quaternion.identity()
        .multiply(qr)
        .multiply(q1)
        .multiply(qp)
        .multiply(q2)
        .multiply(qp.conjugate())
        .multiply(qr.conjugate());
    this.reduceErrorQuaternion();
    return this;
}


export {
    Position
}