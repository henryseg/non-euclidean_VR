import {Quaternion, Vector3, Vector4} from "three";
//import * as utils from "../../../utils/utils.js";

import {Point} from "./Point.js";
import {Position} from "../../../core/geometry/Position.js";


// length of the step when integrating the geodesic flow with an Euler method
const EULER_STEP = 0.001;

Position.prototype.flowFromOrigin = function (v) {
    const t = v.length(); // time travelled along the flow
    const n = t / EULER_STEP; // number of steps

    const u = v.clone().normalize(); // normalized vector (initial condition of Grayson's flow)
    const field = new Vector3(); // vector field for Grayson's flow
    const p_aux = new Point(); // position on the geodesic
    const v_aux = new Vector4(); // tangent vector to the geodesic
    const q_aux = new Quaternion(); // angular velocity

    for (let i = 0; i < n; i++) {
        // computing the position of the geodesic at time i * step
        // push forward the vector from Grayson's flow
        v_aux.set(u.x, u.y, u.z, 0)
            .applyMatrix4(this.boost.matrix)
            .multiplyScalar(EULER_STEP);
        // update the position on the geodesic
        p_aux.coords.add(v_aux);
        // update accordingly the boost of the Position object
        this.boost.makeTranslation(p_aux);

        // computing the facing at time i * step
        // we directly update the quaternion q defining the facing
        // it satisfies the formula dq/dt = (1/2) * omega * q
        // where omega = u_y i + u_x j is the angular velocity vector
        q_aux.set(u.y, u.x, 0, 0)
            .multiply(this.quaternion)
            .multiplyScalar(0.5 * EULER_STEP);
        this.quaternion.add(q_aux).normalize();


        // computing the pull back (at the origin) of the tangent vector at time (i+1)*step
        field.set(
            u.x * u.z,
            -u.y * u.z,
            -u.x * u.x + u.y * u.y
        );
        u.add(field.multiplyScalar(EULER_STEP)).normalize();
    }
    return this;
}

export {
    Position
}