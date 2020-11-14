/**
 * @module Euclidean geometry
 *
 * @description
 * Extension of the abstract geometry modeule for the euclidean space.
 */

import {
  Matrix4,
  Vector4,
} from "../lib/three.module.js"

import {
  Isometry as AbstractIsometry,
  Point as AsbstractPoint,
  Vector as AbstractVector,
} from "./abstract.js"


/**
 * @class
 * @classdesc
 * Euclidean isometries.
 * Represented as a 4x4 matrix.
 */
class Isometry extends AbstractIsometry {

  /**
   * Constructor.
   * Return the identity.
   * @property {Matrix4} matrix - The matrix represneting the isometry.
   */
  constructor() {
    this.matrix = new Matrix4();
  }

  /**
   * Set the current isometry with the given data.
   * @param {array} data - the first entry of data
   * should be the matrix representing the isometry
   * @return {Isometry}
   */
  set(data) {
    this.matrix = data[0].clone();
    return this;
  }

  /**
   * Reduce the eventual numerical errors of the current isometry
   * (typically Gram-Schmidt).
   * @return {Isometry}
   */
  reduceError() {
    return this;
  }

  /**
   * Multiply the current isometry by isom on the left, i.e. replace `this` by `this * isom`.
   * @param {Isometry} isom
   * @return {Isometry}
   */
  multiply(isom) {
    this.matrix.multiply(isom.matrix);
    return this;
  }

  /**
   * Multiply the current isometry by isom on the right, i.e. replace `this` by `isom * this`.
   * @param {Isometry} isom
   * @return {Isometry}
   */
  premultiply(isom) {
    this.matrix.premultiply(isom.matrix);
    return this;
  }

  /**
   * Set the current isometry to the inverse of `isom`.
   * @param {Isometry} isom
   * @return {Isometry}
   */
  getInverse(isom) {
    this.matrix.getInverse(isom.matrix);
    return this;
  }

  /**
   * Return a preferred isometry sending the origin to the given point
   * (typically in Nil, Sol, SL2, etc).
   * @param {Point} point
   * @return {Isometry}
   */
  makeTranslation(point) {
    [x,y,z,] = point.coords;
    this.matrix.set(
      1, 0, 0, x,
      0, 1, 0, y,
      0, 1, 0, z,
      0, 1, 0, 1,
    )
    return this;
  }

  /**
   * Return a preferred isometry sending the given point to the origin
   * (typically in Nil, Sol, SL2, etc).
   * @param {Point} point
   * @return {Isometry}
   */
  makeInvTranslation(point) {
    [x,y,z,] = point.coords;
    this.matrix.set(
      1, 0, 0, -x,
      0, 1, 0, -y,
      0, 1, 0, -z,
      0, 1, 0, 1,
    )
    return this;
  }


  /**
   * Check if the current isometry and `isom` are the same.
   * @param isom
   * @return {boolean}
   */
  equals(isom) {
    return this.matrix.equals(this.isom);
  }

  /**
   * Return a new copy of the current isometry.
   * @return {Isometry}
   */
  clone() {
    let res = new Isometry();
    res.set([this.matrix.clone()]);
    return res;
  }

  /**
   * Set the current isometry with the given isometry
   * @param {Isometry} isom
   * @return {Isometry}
   */
  copy(isom) {
    this.matrix.copy(isom.matrix);
    return this;
  }

  /**
   * Encode the isometry in a way that can be easily passed to the shader.
   * @todo Decide what type is used to pass a position to the shader
   */
  serialize() {
    return [this.matrix,0];
  }
}

/**
 * @class
 *
 * @classdesc
 * Point in the geometry.
 */
class Point{

    /**
     * Constructor.
     * Return the origin of the space.
     * @property {Vector4} coords - the coordinates of the point
     */
    constructor() {
      this.coords = new Vector4(0,0,0,1);
    }

    /**
     * Update the current point with the given data.
     * @param {array} data - the first entry of data
     * are the coordinates of the point as a `Vector4`
     * @return {Point}
     */
    set(data) {
      this.coords = data[0].clone();
      return this;
    }

    /**
     * Translate the current point by the given isometry.
     * @param {Isometry} isom
     * @return {Point}
     */
    applyIsometry(isom) {
      this.coords.applyMatrix4(isom.matrix)
      return this;
    }


    /**
     * Check if the current point and `point ` are the same.
     * @param {Point} point
     * @return {boolean}
     */
    equals(point) {
      return this.coords.equals(point.coords)
    }

    /**
     * Return a new copy of the current point.
     * @return {Point}
     */
    clone() {
      let res = new Point()
      res.set([this.coords.clone()]);
      return res;
    }

    /**
     * set the current point with the given point
     * @param {Point} point
     * @return {Point}
     */
    copy(point) {
      this.coords.copy(point.coords);
      return this;
    }

    /**
     * Encode the point in a way that can be easily passed to the shader.
     * @todo Decide what type is used to pass a position to the shader
     */
    serialize() {
      return this.coords;
    }
}

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
     * Encode the vector in a way that can be easily passed to the shader.
     * @todo Decide what type is used to pass a position to the shader
     */
    serialize() {
      return new Vector3(this.x, this.y, this.z);
    }
}
