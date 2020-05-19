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
    Matrix4,
    Vector3,
    Vector4
} from "./module/three.module.js";

import {
    Isometry
} from "./Isometry.js";

// length of the step when integrating the geodesic flow with an Euler method
const EULER_STEP = 0.001;

Matrix4.prototype.add = function (matrix) {
    // addition of tow 4x4 matrices
    this.set.apply(this, [].map.call(this.elements, function (c, i) {
        return c + matrix.elements[i];
    }));
    return this;
};


const ORIGIN = new Vector4(0, 0, 0, 1);

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
    this.reduceError();
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
    // - S_o is an isometry of X
    // - B_o an element of SO(3)
    // The position after parallel transport along gamma, is (boost * S_o, B_o * facing)



    //mat4 parallel=new Matrix4();

    this.boost.premultiply(new Isometry().makeLeftTranslation(v));
    //no change to facing b/c euclidean 
    // this.facing.premultiply(parallel);
    return this;
}



Position.prototype.getInverse = function (position) {
    // set the current position to the position that can bring back the passed position to the origin position
    this.boost.getInverse(position.boost);
    this.facing.getInverse(position.facing);
    this.reduceError();
    return this;

};

Position.prototype.getFwdVector = function () {
    // return the vector moving forward (taking into account the facing)
    return new Vector3(0, 0, -1).rotateByFacing(this);
};

Position.prototype.getRightVector = function () {
    // return the vector moving right (taking into account the facing)
    return new Vector3(1, 0, 0).rotateByFacing(this);
};

Position.prototype.getUpVector = function () {
    // return the vector moving up (taking into account the facing)
    return new Vector3(0, 1, 0).rotateByFacing(this);
};


Position.prototype.reduceBoostError = function () {
    //    // Hyperbolic Gram-Schmidt
    //    let col0 = new Vector4(1, 0, 0, 0).applyMatrix4(this.boost.matrix);
    //    let col1 = new Vector4(0, 1, 0, 0).applyMatrix4(this.boost.matrix);
    //    let col2 = new Vector4(0, 0, 1, 0).applyMatrix4(this.boost.matrix);
    //    let col3 = new Vector4(0, 0, 0, 1).applyMatrix4(this.boost.matrix);
    //
    //    col0 = hypNormalize(col0);
    //
    //    let aux10 = col0.clone().multiplyScalar(hypDot(col0, col1));
    //    col1 = hypNormalize(col1.sub(aux10));
    //
    //    let aux20 = col0.clone().multiplyScalar(hypDot(col0, col2));
    //    let aux21 = col1.clone().multiplyScalar(hypDot(col1, col2));
    //    col2 = hypNormalize(col2.sub(aux20).sub(aux21));
    //
    //    let aux30 = col0.clone().multiplyScalar(hypDot(col0, col3));
    //    let aux31 = col1.clone().multiplyScalar(hypDot(col1, col3));
    //    let aux32 = col2.clone().multiplyScalar(hypDot(col2, col3));
    //    col3 = hypNormalize(col3.sub(aux30).sub(aux31).sub(aux32));
    //
    //    this.boost.matrix.set(
    //        col0.x, col1.x, col2.x, col3.x,
    //        col0.y, col1.y, col2.y, col3.y,
    //        col0.z, col1.z, col2.z, col3.z,
    //        col0.w, col1.w, col1.w, col3.w
    //    );


    // Nothing to do in Euclidean geometry
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
    let aux = new Vector4(this.x, this.y, this.z, 0).applyMatrix4(position.facing);
    this.set(aux.x, aux.y, aux.z);
    return this;
};

function hypDot(u, v) {
    return u.x * v.x + u.y * v.y + u.z * v.z - u.w * v.w;
};

function hypNorm(v) {
    let L = Math.abs(hypDot(v, v));
    return L;
}

function hypNormalize(v) {
    let len = hypNorm(v);
    let w = v.divideScalar(len);
    return w;
};

export {
    Position,
    ORIGIN
}
