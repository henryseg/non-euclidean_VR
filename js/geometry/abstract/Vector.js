import {
    Vector3,
    Vector4
} from "../../lib/three.module.js";

/**
 * @class
 * @extends Vector3
 *
 * @classdesc
 * Tangent vector at the origin written in the reference frame.
 * Are available form three.js:
 * - all the linear algebra
 * - the length of a vector
 *
 * @todo It seems that this class is actually geometry independent
 * (because of the choice of a reference frame).
 * If so, remove for the other files the class extensions,
 * and replace them by an `export {Vector} from './abstract.js'`
 */
class Vector extends Vector3 {

    /**
     * Overload Three.js `applyMatrix4`.
     * Indeed Three.js considers the `Vector3` as a 3D **point**
     * It multiplies the vector (with an implicit 1 in the 4th dimension) and `m`, and divides by perspective.
     * Here the data represents a **vector**, thus the implicit 4th coordinate is 0
     * @param {Matrix4} m - The matrix to apply
     * @return {Vector} The current vector
     */
    applyMatrix4(m) {
        const aux = new Vector4(this.x, this.y, this.z, 0);
        aux.applyMatrix4(m);
        this.set(aux.x, aux.y, aux.z);
        return this;
    }

    /**
     * Rotate the current vector by the facing component of the position.
     * This method is geometry independent as the coordinates of the vector
     * are given in a chosen reference frame.
     * Only the reference frame depends on the geometry.
     * @param {Position} position
     * @return {Vector} The current vector
     */
    applyFacing(position) {
        this.applyQuaternion(position.quaternion);
        return this;
    }
}

export {
    Vector
}