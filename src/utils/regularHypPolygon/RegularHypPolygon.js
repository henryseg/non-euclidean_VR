import {Matrix3, Vector3} from "three";

/**
 * @class
 *
 * @classdesc
 * Auxiliary computation related to a regular polygon in the hyperbolic plane.
 * The polygon is characterized by its number of sides and the angle at its vertices
 * All the computation below are done in the hyperboloid model
 * We assume that the center of the polygon is the origin, i.e. (0,0,1)
 * The 0-th side is given by the equation  x/z = cst > 0
 * The other sides are number counter clock wise.
 */
export class RegularHypPolygon {

    /**
     * Constructor
     * @param {number} n - number of sides of the polygon
     * @param {number} theta - angle at the vertex
     */
    constructor(n, theta) {
        /**
         * Number of sides of the polygon
         * @type {number}
         */
        this.n = n;
        /**
         * Angle at the apex
         * @type {number}
         */
        this.theta = theta;

        /**
         * Coordinates of the orthogonal projection of the origin onto the 0-th side
         * @type {number[]}
         * @private
         */
        this._sideCoords = undefined;
        /**
         * Translation along the x-axis sending one side to the opposite side
         * (`n` should be even here)
         * @type {Matrix3}
         * @private
         */
        this._translation = undefined;

    }

    /**
     * Return the coordinates of the intersection of the Oxz-plane (with x > 0) with polygon.
     * These coordinates are completely determined by n and theta.
     * @returns {number[]}
     */
    get sideCoords() {
        if (this._sideCoords === undefined) {
            const alpha = Math.PI / this.n;
            const halfTheta = 0.5 * this.theta;

            const sinAlpha = Math.sin(alpha);
            const cosAlpha = Math.cos(alpha);
            const sinHalfTheta = Math.sin(halfTheta);
            const cosHalfTheta = Math.cos(halfTheta);

            const sh = Math.sqrt(cosAlpha ** 2 - sinHalfTheta ** 2) / sinAlpha;
            const ch = cosHalfTheta / sinAlpha;
            this._sideCoords = [sh, 0, ch];
        }
        return this._sideCoords;
    }

    /**
     * Return the coordinates of the i-th vertex
     * @param {number} i
     * @return {Vector3}
     */
    vertexCoords(i) {
        const alpha = Math.PI / this.n;
        const halfTheta = 0.5 * this.theta;

        const sinAlpha = Math.sin(alpha);
        const cosAlpha = Math.cos(alpha);
        const sinHalfTheta = Math.sin(halfTheta);
        const cosHalfTheta = Math.cos(halfTheta);

        const sh = Math.sqrt(cosAlpha ** 2 - sinHalfTheta ** 2) / (sinAlpha * sinHalfTheta);
        const ch = (cosAlpha * cosHalfTheta) / (sinAlpha * sinHalfTheta);
        return new Vector3()
            .set(sh, 0, ch)
            .applyMatrix3(new Matrix3().makeRotation((2 * i + 1) * Math.PI / this.n));
    }

    /**
     * Return a 3x3 matrix, which belongs to S0(2,1) and represents a translation along the x-axis,
     * sending one side to the opposite one
     * (`n` should be even)
     * @returns {Matrix3}
     */
    get translation() {
        if (this._translation === undefined) {
            const [sh, _, ch] = this.sideCoords;
            const ch2 = ch * ch + sh * sh;
            const sh2 = 2 * sh * ch;
            this._translation = new Matrix3().set(
                ch2, 0, sh2,
                0, 1, 0,
                sh2, 0, ch2,
            )
        }
        return this._translation;
    }

    /**
     * The function returns a vector n in R^3 with the following meaning.
     * Assume that p = [x,y,z] is a point on H^2.
     * If dot(n,p) > 0 then the polygon and p are on the opposite side of the i-th segment.
     * If dot(n,p) < 0 then the polygon and p are on the same side of the i-th segment.
     *
     * @param {number} i - the side number
     * @return {Vector3}
     */
    normalTest(i) {
        const [x0, _, z0] = this.sideCoords;
        const n = new Vector3().set(z0, 0, -x0);
        return n.applyMatrix3(new Matrix3().makeRotation(2 * i * Math.PI / this.n));
    }

    /**
     * Return a 3x3 Matrix in S0(2,1) sending the i-th side of the polygon to the j-th side.
     * For this to work properly `n` should be even.
     *
     * @param {number} i - the side number
     * @param {number} j - the side number
     * @return {Matrix3}
     */
    sideIdentification(i, j) {
        return new Matrix3()
            .premultiply(new Matrix3().makeRotation(2 * (0.5 * this.n - i) * Math.PI / this.n))
            .premultiply(this.translation)
            .premultiply(new Matrix3().makeRotation(2 * j * Math.PI / this.n));

    }
}