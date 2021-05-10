import {Matrix4, Quaternion, Vector3} from "../../../lib/three.module.js";

import {SL2} from "./Utils.js";
import {Point} from "./Point.js";
import {Position} from "../../../core/geometry/Position.js";


const ex = new Vector3(1, 0, 0);
const ew = new Vector3(0, 0, 1);

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
    // cylindrical coordinates of u (without the angle alpha)
    const c = u.z;
    this.boost.makeTranslationFromUnitDir(u, t);

    // parallel transport
    // The quaternion corresponding to e^{-2ctU_1} in the paper
    const q1 = new Quaternion().setFromAxisAngle(ew, -2 * c * t);
    // The quaternion corresponding to e^{(t/2)U2} in the paper
    const q2 = new Quaternion().setFromAxisAngle(ex, 0.5 * t);
    // The quaternion corresponding to R_alpha * P in the paper
    // This is a matrix sending e_x to u
    // Such a matrix is well-defined up to a rotation around e_x.
    // However the formula in the paper shows that
    // the parallel transport operator Q does not depend on this choice.
    const qp = new Quaternion().setFromUnitVectors(ex, u);

    // making the product
    // note that (in the paper) R_alpha and e^{ctU_1} commutes
    // thus the order is correct
    this.quaternion.identity()
        .multiply(q1)
        .multiply(qp)
        .multiply(q2)
        .multiply(qp.conjugate());
    this.reduceErrorQuaternion();
    return this;
}

export {
    Position
}