/*

    Representation of the position of the observer / an object
    A position is given by
    - a `boost` which is an Isometry moving the origin to the point where the observer is
    - a `facing` which determines where the observer is looking at. It is a element of SO(3) encoded as a 4x4 matrix

    More abstractly there is a map from Isom(X) x SO(3) -> Frame bundle, sending (L, A) to  d_o L A f where
    - o is the origin
    - f is a fixed (reference) frame in the tangent space of X at o
    Note that the point stabilizer G_o of o in Isom(X) acts on the set of positions as follows
    (L, A) . U = (LU^{-1},  d_o U A)
    The G_o -orbits of a position is exactly the fiber of the map Isom(X) x SO(3) -> Frame bundle

*/

import {
    Matrix3,
    Matrix4,
    Vector3,
    Vector4
} from "./module/three.module.js";

import {
    Isometry,
    H2Elt
} from "./Isometry.js";


/**
 * We represent the points of the universal cover X of SL(2,R) as Vector4 where
 * - the first three coordinates are its projection on H^2 in the hyperboloid model
 * - the last coordinate is the angle in the fiber
 * The origin of the space (corresponding to the identity of X) is (0,0,1,0)
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
 **/


const ORIGIN = new Vector4(0, 0, 1, 0);

function Position() {
    // By default the return position is the origin (with the "default" facing - negative z-direction ?)
    this.boost = new Isometry();
    this.facing = new Matrix4();
}

Position.prototype.setBoost = function (boost) {
    this.boost = boost.clone();
    return this;
};

Position.prototype.setFacing = function (facing) {
    this.facing = facing.clone();
    return this;
};

Position.prototype.set = function (boost, facing) {
    this.setBoost(boost);
    this.setFacing(facing);
    return this;
};

Position.prototype.translateBy = function (isom) {
    // translate the position by the given isometry
    this.boost.premultiply(isom);
    this.reduceBoostError();
    return this;
};

Position.prototype.localTranslateBy = function (isom) {
    // if we are at boost of b, our position is b.0. We want to fly forward, and isom
    // tells me how to do this if I were at 0. So I want to apply b * isom * b^{-1} to b * 0, and I get b * isom * 0.
    // In other words, translate boost by the conjugate of isom by boost
    this.boost.multiply(isom);
    this.reduceBoostError();
    return this;
};

/*
Position.prototype.rotateFacingBy = function (rotation) {
    // apply the given matrix (on the left) to the current facing and return the new result
    this.facing.premultiply(rotation);
    this.reduceFacingError();
    return this;
};
*/

Position.prototype.localRotateFacingBy = function (rotation) {
    // apply the given matrix (on the right) to the current facing and return the new result
    this.facing.multiply(rotation);
    this.reduceFacingError();
    return this;
};


/*
Position.prototype.flow = function (v) {
    // move the position following the geodesic flow
    // the geodesic starts at the origin, its tangent vector is v
    // parallel transport the facing along the geodesic

    // in Euclidean geometry, just apply a translation
    // Nothing to do on the facing
    let isom = new Isometry().makeLeftTranslation(v.x, v.y, v.z);
    return this.translateBy(isom);
};
 */

Position.prototype.localFlow = function (v) {
    // move the position following the geodesic flow where
    // v is the pull back at the origin by this.boost of the tangent vector at boost * o

    // Let gamma be the geodesic starting at p = boost * o directed by boost * v
    // Let gamma_o be the geodesic starting at o directed by v, i.e. gamma_o = boost^{-1} gamma
    // The parallel transport along gamma_o is an operator T_o which we split as T_o = dS_o B_o where
    // - S_o is an isometry of X moving o to the endpoint of gamma_o
    // - B_o an element of SO(3)
    // The position after parallel transport along gamma, is (boost * S_o, B_o * facing)

    const t = v.length();
    let aux = v.clone().normalize();
    // flip (if needed) the tangent vector so that its fiber coordinate is positive.
    let flipped = false;
    if (aux.z < 0) {
        aux.flip();
        flipped = true;
    }

    // the angle alpha is characterized as follows
    // if u is a tangent vector of the form (0, a1, a2) with a1, a2 >= 0
    // then aux is obtained from u by a rotation of angle alpha
    // In particular, if nu_o is the geodesic starting from o oriented by u
    // then the geodesic starting from o oriented by aux is obtained from nu_o by a rotation of angle alpha
    const alpha = Math.atan2(aux.y, aux.x) - Math.PI / 2;
    const a2 = aux.z;
    const a1 = Math.sqrt(1 - a2 * a2);


    let phi = 2 * a1 * t;   // the angle in the fiber achieved by the geodesic
    let point = new H2Elt();    // the point H2 achieved by the geodesic
    let omega = 0;  // the "angular velocity" of rotations involved in the geodesic flow


    // the geodesic flow distinguishes three cases
    if (a2 < a1) {
        omega = Math.sqrt(a1 * a1 - a2 * a2);

        point.set(new Vector3(
            2 * a1 * Math.cosh(omega * t) * Math.sinh(omega * t) / omega,
            -2 * a1 * a2 * Math.pow(Math.sinh(omega * t) / omega, 2),
            1 + 2 * Math.pow(a1 * Math.sinh(omega * t) / omega, 2)
        ));
        phi = phi + Math.atan2(point.coord.y, point.coord.x);

    } else if (a2 === a1) {
        point.set(new Vector3(
            Math.sqrt(2) * t,
            -Math.pow(t, 2),
            Math.pow(t, 2) + 1
        ));
        phi = phi + Math.atan2(point.coord.y, point.coord.x);
    } else {
        omega = Math.sqrt(a2 * a2 - a1 * a1);
        point.set(new Vector3(
            2 * a1 * Math.cos(omega * t) * Math.sin(omega * t) / omega,
            -2 * a1 * a2 * Math.pow(Math.sin(omega * t) / omega, 2),
            1 + 2 * Math.pow(a1 * Math.sin(omega * t) / omega, 2)
        ));
        phi = phi + Math.atan2(point.coord.y, point.coord.x) + 2 * Math.floor(0.5 - 0.5 * omega * t / Math.PI) * Math.PI;
    }


    // rotate the geodesic by alpha
    point.rotateBy(alpha);
    // "un-flip" the geodesic, if needed
    if (flipped) {
        phi = -phi;
        point.flip();
    }

    let isom = new Isometry().set([phi, point]);
    this.boost.multiply(isom);

    // the parallel transport does not distinguish cases
    const P = new Matrix4().set(
        1, 0, 0, 0,
        0, a2, a1, 0,
        0, -a1, a2, 0,
        0, 0, 0, 1
    );
    const Pinv = new Matrix4().getInverse(P);
    const etD = new Matrix4().set(
        Math.cos(t), -Math.sin(t), 0, 0,
        Math.sin(t), Math.cos(t), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
    let Q = new Matrix4().set(
        Math.cos(4 * a2 * t), Math.sin(4 * a2 * t), 0, 0,
        -Math.sin(4 * a2 * t), Math.cos(4 * a2 * t), 0, 0,
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
    return this;

};

Position.prototype.getInverse = function (position) {
    // set the current position to the position that can bring back the passed position to the origin position
    this.boost.getInverse(position.boost);
    this.facing.getInverse(position.facing);
    this.reduceError();
    return this;

};

Position.prototype.getFwdVector = function (t = 1) {
    // return the vector of length t moving forward (taking into account the facing)
    return new Vector3(0, 0, t).rotateByFacing(this);
};

Position.prototype.getRightVector = function (t = 1) {
    // return the vector of length t moving right (taking into account the facing)
    return new Vector3(t, 0, 0).rotateByFacing(this);
};

Position.prototype.getUpVector = function (t = 1) {
    // return the vector of length t moving up (taking into account the facing)
    return new Vector3(0, t, 0).rotateByFacing(this);
};

Position.prototype.reduceBoostError = function () {
    this.boost.reduceError();
    return this;
};

Position.prototype.reduceFacingError = function () {
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

Position.prototype.reduceError = function () {
    this.reduceBoostError();
    this.reduceFacingError();
    return this;
};

Position.prototype.equals = function (position) {
    // test equality of isometries (for debugging purpose mostly)
    return (this.boost.equals(position.boost) && this.facing.equals(position.facing));
};

Position.prototype.clone = function () {
    return new Position().set(this.boost, this.facing);
};


/*

    Rotating a vector

*/

Vector3.prototype.rotateByFacing = function (position) {
    let aux = new Matrix3().setFromMatrix4(position.facing);
    this.applyMatrix3(aux);
    return this;
};


export {
    Position,
    ORIGIN
}