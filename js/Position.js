/**
 * Representation of the position of the observer / an object
 * A position is given by
 * - a `boost` which is an Isometry moving the origin to the point where the observer is
 * - a `facing` which determines where the observer is looking at. It is a element of SO(3) encoded as a 4x4 matrix
 *
 * More abstractly there is a map from Isom(X) x SO(3) -> Frame bundle, sending (L, A) to  d_o L A f where
 * - o is the origin
 * - f is a fixed (reference) frame in the tangent space of X at o
 * Note that the point stabilizer G_o of o in Isom(X) acts on the set of positions as follows
 * (L, A) . U = (LU^{-1},  d_o U A)
 * The G_o -orbits of a position is exactly the fiber of the map Isom(X) x SO(3) -> Frame bundle
 *
 * @module Position
 */


import {
    Matrix3,
    Matrix4,
    Vector3,
    Vector4
} from "./module/three.module.js";

import {
    Point,
    Vector,
    Isometry
} from "./Geometry.js";


// Function for debugging

// Return a human-readable version of the matrix
Matrix4.prototype.toLog = function () {
    let res = '\r\n';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (j !== 0) {
                res = res + ",\t";
            }
            res = res + this.elements[i + 4 * j];
        }
        res = res + "\r\n";
    }
    return res;
}


// Return a human-readable version of the matrix
Matrix3.prototype.toLog = function () {
    let res = '\r\n';
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (j !== 0) {
                res = res + ",\t";
            }
            res = res + this.elements[i + 3 * j];
        }
        res = res + "\r\n";
    }
    return res;
}


/**
 * Position
 *
 * A position is a pair (boost, facing) where
 * - boost is an isometry of X (associated to a point of X)
 * - the facing is an element of SO(3) (seen as 4x4 matrix)
 *
 * We identify the tangent space at the origin of X, with the Lie algebra of SL(2,R) in its hyperboloid model
 * A tangent vector is represented by a Vector3.
 * - the last coordinates corresponds to the fiber
 * - the other two correspond to the directions in H^2
 *
 * @class
 * @public
 *
 **/
class Position {

    /**
     * Create a position which representing the origin with the reference frame
     * @constructor
     */
    constructor() {
        /** @property {Isometry} boost - the isometry part of the position */
        this.boost = new Isometry();
        /** @property {Matrix4} facing - the facing part of the position */
        this.facing = new Matrix4();
    }

    /**
     * Set the boost of the position
     * @param {Isometry} boost - the new boost
     * @returns {Position} - the current position
     */
    setBoost(boost) {
        this.boost.copy(boost);
        return this;
    }

    /**
     * Set the facing of the position
     * @param {Matrix4} facing - the new facing
     * @returns {Position} - the current position
     */
    setFacing(facing) {
        this.facing.copy(facing);
        return this;
    }

    /**
     * Set the boost and facing of the position
     * @param {Isometry} boost - the new boost
     * @param {Matrix4} facing - the new facing
     * @returns {Position} - the current position
     */
    set(boost, facing) {
        this.setBoost(boost);
        this.setFacing(facing);
        return this;
    };

    /**
     * Translate the position by the given isometry
     * @param {Isometry} isom - the translation
     * @returns {Position} - the current position
     */
    translateBy(isom) {
        this.boost.premultiply(isom);
        this.reduceBoostError();
        return this;
    };

    /**
     * Translation from the origin:
     * if we are at boost of b, our position is b.0. We want to fly forward, and isom
     * tells me how to do this if I were at 0. So I want to apply b * isom * b^{-1} to b * 0, and I get b * isom * 0.
     * In other words, translate boost by the conjugate of isom by boost
     * @param {Isometry} isom - the translation (pulled by at the origin)
     * @returns {Position} - the current position
     */
    localTranslateBy(isom) {
        this.boost.multiply(isom);
        this.reduceBoostError();
        return this;
    }

    /**
     * Apply the given matrix (on the right) to the current facing and return the new result
     * @param {Matrix4} rotation - the rotation to apply
     * @returns {Position} - the current position
     */
    rotateFacingBy(rotation) {
        this.facing.multiply(rotation);
        this.reduceFacingError();
        return this;
    }

    /**
     * Move the position following the geodesic flow.
     *
     * v is the pull back at the origin by this.boost of the tangent vector at boost * o
     * Let gamma be the geodesic starting at p = boost * o directed by boost * v
     * Let gamma_o be the geodesic starting at o directed by v, i.e. gamma_o = boost^{-1} gamma
     * The parallel transport along gamma_o is an operator T_o which we split as T_o = dS_o B_o where
     * - S_o is an isometry of X moving o to the endpoint of gamma_o
     * - B_o an element of SO(3)
     * The position after parallel transport along gamma, is (boost * S_o, B_o * facing)
     *
     * @param {Vector} v - pull back at the origin by this.boost of the tangent vector at boost * o
     * @todo Move the code of the flow in the Geometry.js file, to make the Position.js file geometry independent ?
     * Another is to define an abstract class, where the flow will be overwritten for each geometry
     * @returns {Position} - the current position
     */
    flow(v) {

        const t = v.length();
        let aux = v.clone().normalize();

        // flip (if needed) the tangent vector so that its fiber coordinate is positive.
        let flipped = false;
        if (aux.z < 0) {
            aux.flip();
            flipped = true;
        }

        // the angle alpha is characterized as follows
        // if u is a tangent vector of the form (a, 0, c) with a, c >= 0
        // then aux is obtained from u by a rotation of angle alpha
        // In particular, if nu_o is the geodesic starting from o oriented by u
        // then the geodesic starting from o oriented by aux is obtained from nu_o by a rotation of angle alpha
        const alpha = Math.atan2(aux.y, aux.x);
        const c = aux.z;
        const a = Math.sqrt(1 - c * c);


        let phi = c * t; // the angle in the fiber achieved by the geodesic (before final adjustment)
        let omega = 0;  // the "pulsatance" involved in the geodesic flow.
        let point = new Point();
        let h2_point = new Vector3(0, 0, 1);

        // the geodesic flow distinguishes three cases
        if (Math.abs(c - a) * t < 0.05) {
            // parabolic trajectory
            // we use an asymptotic expansion of the solution around the critical case (c = a)
            // to reduce the numerical errors
            let a2 = a * a;
            let omega2 = a * a - c * c;
            let omega4 = omega2 * omega2;
            let omega6 = omega4 * omega2;
            let t2 = t * t;
            let t3 = t2 * t;
            let t4 = t3 * t;
            let t5 = t4 * t;
            let t6 = t5 * t;
            let t7 = t6 * t;
            let t8 = t7 * t;

            h2_point.set(
                a * t + a * t3 * omega2 / 6. + a * t5 * omega4 / 120. + a * t7 * omega6 / 5040.,
                -a * c * t2 / 2. - a * c * omega2 * t4 / 24. - a * c * omega4 * t6 / 720. - a * c * omega6 * t8 / 40320.,
                1. + a2 * t2 / 2. + a2 * omega2 * t4 / 24. + a2 * omega4 * t6 / 720. + a2 * omega6 * t4 / 40320.
            );
            point.set(
                h2_point.x,
                h2_point.y,
                h2_point.z,
                phi + Math.atan2(h2_point.y, h2_point.x)
            );
        } else if (c < a) {
            // hyperbolic trajectory
            omega = Math.sqrt(a * a - c * c);
            let T = new Matrix3().set(
                1, 0, 0,
                0, a / omega, -c / omega,
                0, -c / omega, a / omega
            );
            let Tinv = new Matrix3().set(
                1, 0, 0,
                0, a / omega, c / omega,
                0, c / omega, a / omega
            );
            let shift = new Matrix3().set(
                Math.cosh(omega * t), 0, Math.sinh(omega * t),
                0, 1, 0,
                Math.sinh(omega * t), 0, Math.cosh(omega * t)
            );
            let m = new Matrix3().multiply(T).multiply(shift).multiply(Tinv);
            h2_point.applyMatrix3(m);

            point.set(
                h2_point.x,
                h2_point.y,
                h2_point.z,
                phi + Math.atan2(h2_point.y, h2_point.x)
            );

        } else {
            // remaining case: c > a
            // elliptic trajectory
            omega = Math.sqrt(c * c - a * a);
            let T = new Matrix3().set(
                1, 0, 0,
                0, c / omega, -a / omega,
                0, -a / omega, c / omega
            );
            let Tinv = new Matrix3().set(
                1, 0, 0,
                0, c / omega, a / omega,
                0, a / omega, c / omega
            );
            let rot = new Matrix3().set(
                Math.cos(omega * t), Math.sin(omega * t), 0,
                -Math.sin(omega * t), Math.cos(omega * t), 0,
                0, 0, 1
            )
            let m = new Matrix3().multiply(T).multiply(rot).multiply(Tinv);
            h2_point.applyMatrix3(m);

            point.set(
                h2_point.x,
                h2_point.y,
                h2_point.z,
                phi + Math.atan2(point.y, point.x) + 2 * Math.floor(0.5 - 0.25 * omega * t / Math.PI) * Math.PI
            );
        }

        // rotate the geodesic by alpha
        point.rotateBy(alpha);

        //console.log("point after rotation", point);
        // "un-flip" the geodesic, if needed
        if (flipped) {
            point.flip();
        }

        //console.log("point after flip", point);

        let isom = point.makeTranslation();

        //console.log("isom target", isom.target);

        this.boost.multiply(isom);

        //console.log('flow reached point', this.boost.target);

        // the parallel transport does not distinguish cases
        const P = new Matrix4().set(
            a, 0, -c, 0,
            0, 1, 0, 0,
            c, 0, a, 0,
            0, 0, 0, 1
        );
        const Pinv = new Matrix4().set(
            a, 0, c, 0,
            0, 1, 0, 0,
            -c, 0, a, 0,
            0, 0, 0, 1
        );
        const etD = new Matrix4().set(
            1, 0, 0, 0,
            0, Math.cos(t / 2), -Math.sin(t / 2), 0,
            0, Math.sin(t / 2), Math.cos(t / 2), 0,
            0, 0, 0, 1
        );
        let Q = new Matrix4().set(
            Math.cos(2 * c * t), Math.sin(2 * c * t), 0, 0,
            -Math.sin(2 * c * t), Math.cos(2 * c * t), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
        Q.multiply(P).multiply(etD).multiply(Pinv);

        const R = new Matrix4().set(
            Math.cos(alpha), -Math.sin(alpha), 0, 0,
            Math.sin(alpha), Math.cos(alpha), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
        const Rinv = new Matrix4().set(
            Math.cos(alpha), Math.sin(alpha), 0, 0,
            -Math.sin(alpha), Math.cos(alpha), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
        Q.premultiply(R);
        Q.multiply(Rinv);

        if (flipped) {
            const F = new Matrix4().set(
                0, 1, 0, 0,
                1, 0, 0, 0,
                0, 0, -1, 0,
                0, 0, 0, 1
            );
            Q.premultiply(F);
            Q.multiply(F);
        }

        this.facing.premultiply(Q);
        //console.log('flow position', this);
        return this;


    }

    /**
     * Set the current position to the position that can bring back the passed position to the origin position
     * @param {Position} position - the position to inverse
     * @returns {Position} - the current position
     */
    getInverse(position) {
        this.boost.getInverse(position.boost);
        this.facing.getInverse(position.facing);
        this.reduceError();
        return this;
    }

    /**
     * Return the vector of length t moving forward (taking into account the facing)
     * @param {number} t - the length of the vector
     * @returns {Vector} - the forward vector
     */
    getFwdVector(t = 1) {
        return new Vector().set(0, 0, -t).rotateByFacing(this);
    };

    /**
     * Return the vector of length t moving right (taking into account the facing)
     * @param {number} t - the length of the vector
     * @returns {Vector} - the right vector
     */
    getRightVector(t = 1) {
        return new Vector().set(t, 0, 0).rotateByFacing(this);
    };

    /**
     * Return the vector of length t moving up (taking into account the facing)
     * @param {number} t - the length of the vector
     * @returns {Vector} - the upward vector
     */
    getUpVector(t = 1) {
        return new Vector().set(0, t, 0).rotateByFacing(this);
    };

    /**
     * Correct the errors in the boost part
     * @returns {Position} - the current position
     */
    reduceBoostError() {
        this.boost.reduceError();
        return this;
    };

    /**
     * Correct the errors in the facing part (Gram-Schmidt)
     * @returns {Position} - the current position
     */
    reduceFacingError() {
        // Gram-Schmidt
        let col0 = new Vector4(1, 0, 0, 0).applyMatrix4(this.facing);
        let col1 = new Vector4(0, 1, 0, 0).applyMatrix4(this.facing);
        let col2 = new Vector4(0, 0, 1, 0).applyMatrix4(this.facing);

        col0.normalize();

        let aux10 = col0.clone().multiplyScalar(col0.dot(col1));
        col1.sub(aux10).normalize();

        let aux20 = col0.clone().multiplyScalar(col0.dot(col2));
        let aux21 = col1.clone().multiplyScalar(col1.dot(col2));
        col2.sub(aux20).sub(aux21).normalize();

        this.facing.set(
            col0.x, col1.x, col2.x, 0.,
            col0.y, col1.y, col2.y, 0.,
            col0.z, col1.z, col2.z, 0.,
            0., 0., 0., 1.
        );
        return this;
    };

    /**
     * Correct the errors in the boost and the facing
     * @returns {Position} - the current position
     */
    reduceError() {
        this.reduceBoostError();
        this.reduceFacingError();
        return this;
    };

    /**
     * Test if two instances of Position represents the same position
     * @param {Position} position - an other position
     * @returns {boolean} - true if the positions are the same, and false otherwise
     */
    equals(position) {
        return (this.boost.equals(position.boost) && this.facing.equals(position.facing));
    };

    /**
     * Return a copy of the current position
     * @returns {Position} - the copy of the current position
     */
    clone() {
        return new Position().set(this.boost, this.facing);
    };

}


export {
    Position
}