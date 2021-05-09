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
    const a = Math.sqrt(1 - c * c);

    const target = new Point();
    const spin = new SL2().set(Math.cos(c * t), Math.sin(c * t), 0, 0);
    let w = 2 * c * t; // the angle in the fiber achieved by the geodesic (before final adjustment)
    let omega;  // the "pulsatance" involved in the geodesic flow.
    let tanPhi;

    const absC = Math.abs(c);
    if (a === absC) {
        // parabolic trajectory
        target.proj.set(
            1,
            -0.25 * Math.sqrt(2) * t,
            0.5 * t,
            0
        );
        tanPhi = -0.25 * Math.sqrt(2) * t;
        target.fiber = w + 2 * Math.atan(tanPhi);
    } else if (a > absC) {
        // hyperbolic trajectory
        omega = Math.sqrt(a * a - c * c);
        target.proj.set(
            Math.cosh(0.5 * omega * t),
            -(c / omega) * Math.sinh(0.5 * omega * t),
            (1 / omega) * Math.sinh(0.5 * omega * t),
            0
        );
        tanPhi = -(c / omega) * Math.tanh(0.5 * omega * t);
        target.fiber = w + 2 * Math.atan(tanPhi);

    } else if (a < absC) {
        // elliptic trajectory
        omega = Math.sqrt(c * c - a * a);
        target.proj.set(
            Math.cos(0.5 * omega * t),
            -(c / omega) * Math.sin(0.5 * omega * t),
            (1 / omega) * Math.sin(0.5 * omega * t),
            0
        );
        tanPhi = -(c / omega) * Math.tan(0.5 * omega * t);
        let n = Math.floor(0.5 * omega * t / Math.PI + 0.5);
        if (c < 0) {
            n = -n;
        }
        target.fiber = w + 2 * Math.atan(tanPhi) - 2 * n * Math.PI;
    }
    target.proj.multiply(spin);
    // note that the coefficient a is missing on the third coordinate in the translation part above.
    // the reason is that it is implicitly in the rotation/scaling matrix below
    const rotation = new Matrix4().set(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, u.x, -u.y,
        0, 0, u.y, u.x
    );
    target.proj.applyMatrix4(rotation);
    this.boost.makeTranslation(target);

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