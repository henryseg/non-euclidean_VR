import {Vector3, Vector4, Matrix4} from "three";

/**
 * @class
 * @extends Vector3
 *
 * @classdesc
 * Tangent vector at the origin written in the reference frame.
 * Are available form three.js:
 * - all the linear algebra
 * - the length of a vector
 */
class Vector extends Vector3 {

    /**
     * True if the object implements the class `Vector`
     * @return {boolean}
     */
    get isVector() {
        return true;
    }

    /**
     * Overload Three.js `applyMatrix4`.
     * Indeed, Three.js considers the `Vector3` as a 3D **point**.
     * It multiplies the vector (with an implicit 1 in the 4th dimension) by the matrix, and divides by perspective.
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