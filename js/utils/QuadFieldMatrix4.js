import {QuadFieldElt, one, zero} from "./QuadFieldElt.js";
import {Matrix4} from "../lib/three.module.js";


/**
 * @class
 *
 * @classdesc
 * 4x4 matrix over a quadratic field
 * @author Mostly borrowed from Three.js
 */
export class QuadFieldMatrix4 {

    constructor() {
        /**
         * The elements of the matrix, in a  column-major order
         * @type {QuadFieldElt[]}
         */
        this.elements = [
            one.clone(), zero.clone(), zero.clone(), zero.clone(),
            zero.clone(), one.clone(), zero.clone(), zero.clone(),
            zero.clone(), zero.clone(), one.clone(), zero.clone(),
            zero.clone(), zero.clone(), zero.clone(), one.clone()
        ];
    }

    /**
     * Flag to precise the type of the object
     * @type {boolean}
     */
    get isQuadFieldMatrix4() {
        return true;
    }

    /**
     * Set the elements of this matrix to the supplied row-major values n11, n12, ... n44.
     * @param {QuadFieldElt} n11
     * @param {QuadFieldElt} n12
     * @param {QuadFieldElt} n13
     * @param {QuadFieldElt} n14
     * @param {QuadFieldElt} n21
     * @param {QuadFieldElt} n22
     * @param {QuadFieldElt} n23
     * @param {QuadFieldElt} n24
     * @param {QuadFieldElt} n31
     * @param {QuadFieldElt} n32
     * @param {QuadFieldElt} n33
     * @param {QuadFieldElt} n34
     * @param {QuadFieldElt} n41
     * @param {QuadFieldElt} n42
     * @param {QuadFieldElt} n43
     * @param {QuadFieldElt} n44
     * @return {QuadFieldMatrix4}
     */
    set(n11, n12, n13, n14,
        n21, n22, n23, n24,
        n31, n32, n33, n34,
        n41, n42, n43, n44) {

        const te = this.elements;

        te[0].copy(n11);
        te[4].copy(n12);
        te[8].copy(n13);
        te[12].copy(n14);
        te[1].copy(n21);
        te[5].copy(n22);
        te[9].copy(n23);
        te[13].copy(n24);
        te[2].copy(n31);
        te[6].copy(n32);
        te[10].copy(n33);
        te[14].copy(n34);
        te[3].copy(n41);
        te[7].copy(n42);
        te[11].copy(n43);
        te[15].copy(n44);

        return this;

    }

    /**
     * Set the current matrix to the identiy
     */
    identity() {
        this.elements = [
            one.clone(), zero.clone(), zero.clone(), zero.clone(),
            zero.clone(), one.clone(), zero.clone(), zero.clone(),
            zero.clone(), zero.clone(), one.clone(), zero.clone(),
            zero.clone(), zero.clone(), zero.clone(), one.clone()
        ];
        return this;
    }

    /**
     * Set the matrix to the product a * b
     * @param {QuadFieldMatrix4} a
     * @param {QuadFieldMatrix4} b
     * @return {QuadFieldMatrix4}
     */
    multiplyMatrices(a, b) {

        const ae = a.elements;
        const be = b.elements;
        const te = this.elements;

        const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
        const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
        const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
        const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

        const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
        const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
        const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
        const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];


        // te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        te[0] = new QuadFieldElt().addProduct(a11, b11).addProduct(a12, b21).addProduct(a13, b31).addProduct(a14, b41);
        // te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        te[4] = new QuadFieldElt().addProduct(a11, b12).addProduct(a12, b22).addProduct(a13, b32).addProduct(a14, b42);
        // te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        te[8] = new QuadFieldElt().addProduct(a11, b13).addProduct(a12, b23).addProduct(a13, b33).addProduct(a14, b43);
        // te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
        te[12] = new QuadFieldElt().addProduct(a11, b14).addProduct(a12, b24).addProduct(a13, b34).addProduct(a14, b44);

        // te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        te[1] = new QuadFieldElt().addProduct(a21, b11).addProduct(a22, b21).addProduct(a23, b31).addProduct(a24, b41);
        // te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        te[5] = new QuadFieldElt().addProduct(a21, b12).addProduct(a22, b22).addProduct(a23, b32).addProduct(a24, b42);
        // te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        te[9] = new QuadFieldElt().addProduct(a21, b13).addProduct(a22, b23).addProduct(a23, b33).addProduct(a24, b43);
        // te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
        te[13] = new QuadFieldElt().addProduct(a21, b14).addProduct(a22, b24).addProduct(a23, b34).addProduct(a24, b44);

        // te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        te[2] = new QuadFieldElt().addProduct(a31, b11).addProduct(a32, b21).addProduct(a33, b31).addProduct(a34, b41);
        // te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        te[6] = new QuadFieldElt().addProduct(a31, b12).addProduct(a32, b22).addProduct(a33, b32).addProduct(a34, b42);
        // te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        te[10] = new QuadFieldElt().addProduct(a31, b13).addProduct(a32, b23).addProduct(a33, b33).addProduct(a34, b43);
        // te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
        te[14] = new QuadFieldElt().addProduct(a31, b14).addProduct(a32, b24).addProduct(a33, b34).addProduct(a34, b44);

        // te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        te[3] = new QuadFieldElt().addProduct(a41, b11).addProduct(a42, b21).addProduct(a43, b31).addProduct(a44, b41);
        // te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        te[7] = new QuadFieldElt().addProduct(a41, b12).addProduct(a42, b22).addProduct(a43, b32).addProduct(a44, b42);
        // te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        te[11] = new QuadFieldElt().addProduct(a41, b13).addProduct(a42, b23).addProduct(a43, b33).addProduct(a44, b43);
        // te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
        te[15] = new QuadFieldElt().addProduct(a41, b14).addProduct(a42, b24).addProduct(a43, b34).addProduct(a44, b44);

        return this;
    }


    /**
     * Matrix multiplication
     * @param {QuadFieldMatrix4} m
     * @return {QuadFieldMatrix4}
     */
    multiply(m) {
        return this.multiplyMatrices(this, m);
    }

    /**
     * Matrix pre-multiplication
     * @param {QuadFieldMatrix4} m
     * @return {QuadFieldMatrix4}
     */
    premultiply(m) {
        return this.multiplyMatrices(m, this);
    }

    /**
     * Multiply the matrix by a scalar
     * @param {QuadFieldElt} s
     * @return {QuadFieldMatrix4}
     */
    multiplyScalar(s) {
        for (let i = 0; i < 16; i++) {
            this.elements[i].multiply(s);
        }
        return this;
    }

    /**
     * Determinant of the matrix
     * @return {QuadFieldElt}
     */
    determinant() {

        const te = this.elements;

        const n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
        const n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
        const n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
        const n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];

        //TODO: make this more efficient
        //( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

        return new QuadFieldElt()
            .add(
                n41.clone().multiply(
                    new QuadFieldElt()
                        .addProduct(n14, n23, n32)
                        .subProduct(n13, n24, n32)
                        .subProduct(n14, n22, n33)
                        .addProduct(n12, n24, n33)
                        .addProduct(n13, n22, n34)
                        .subProduct(n12, n23, n34)
                )
            )
            .add(
                n42.clone().multiply(
                    new QuadFieldElt()
                        .addProduct(n11, n23, n34)
                        .subProduct(n11, n24, n33)
                        .addProduct(n14, n21, n33)
                        .subProduct(n13, n21, n34)
                        .addProduct(n13, n24, n31)
                        .subProduct(n14, n23, n31)
                )
            )
            .add(
                n43.clone().multiply(
                    new QuadFieldElt()
                        .addProduct(n11, n24, n32)
                        .subProduct(n11, n22, n34)
                        .subProduct(n14, n21, n32)
                        .addProduct(n12, n21, n34)
                        .addProduct(n14, n22, n31)
                        .subProduct(n12, n24, n31)
                )
            )
            .add(
                n44.clone().multiply(
                    new QuadFieldElt()
                        .subProduct(n13, n22, n31)
                        .subProduct(n11, n23, n32)
                        .addProduct(n11, n22, n33)
                        .addProduct(n13, n21, n32)
                        .subProduct(n12, n21, n33)
                        .addProduct(n12, n23, n31)
                )
            );

    }

    /**
     * Set the matrix to its transpose
     * @return {QuadFieldMatrix4}
     */
    transpose() {

        const te = this.elements;
        let tmp = new QuadFieldElt();

        tmp.copy(te[1]);
        te[1].copy(te[4]);
        te[4].copy(tmp);

        tmp.copy(te[2]);
        te[2].copy(te[8]);
        te[8].copy(tmp);

        tmp.copy(te[6]);
        te[6].copy(te[9]);
        te[9].copy(tmp);

        tmp.copy(te[3]);
        te[3].copy(te[12]);
        te[12].copy(tmp);

        tmp.copy(te[7]);
        te[7].copy(te[13]);
        te[13].copy(tmp);

        tmp.copy(te[11]);
        te[11].copy(te[14]);
        te[14].copy(tmp);

        return this;
    }

    /**
     * Set the matrix to its inverse
     * @return {QuadFieldMatrix4}
     */
    invert() {

        // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
        const te = this.elements,

            n11 = te[0], n21 = te[1], n31 = te[2], n41 = te[3],
            n12 = te[4], n22 = te[5], n32 = te[6], n42 = te[7],
            n13 = te[8], n23 = te[9], n33 = te[10], n43 = te[11],
            n14 = te[12], n24 = te[13], n34 = te[14], n44 = te[15],

            t11 = new QuadFieldElt()
                .addProduct(n23, n34, n42)
                .subProduct(n24, n33, n42)
                .addProduct(n24, n32, n43)
                .subProduct(n22, n34, n43)
                .subProduct(n23, n32, n44)
                .addProduct(n22, n33, n44),
            t12 = new QuadFieldElt()
                .addProduct(n14, n33, n42)
                .subProduct(n13, n34, n42)
                .subProduct(n14, n32, n43)
                .addProduct(n12, n34, n43)
                .addProduct(n13, n32, n44)
                .subProduct(n12, n33, n44),
            t13 = new QuadFieldElt()
                .addProduct(n13, n24, n42)
                .subProduct(n14, n23, n42)
                .addProduct(n14, n22, n43)
                .subProduct(n12, n24, n43)
                .subProduct(n13, n22, n44)
                .addProduct(n12, n23, n44),
            t14 = new QuadFieldElt()
                .addProduct(n14, n23, n32)
                .subProduct(n13, n24, n32)
                .subProduct(n14, n22, n33)
                .addProduct(n12, n24, n33)
                .addProduct(n13, n22, n34)
                .subProduct(n12, n23, n34);

        const det = new QuadFieldElt()
            .add(n11.clone().multiply(t11))
            .add(n21.clone().multiply(t12))
            .add(n31.clone().multiply(t13))
            .add(n41.clone().multiply(t14));

        if (det.isZero()) throw  new Error('QuadFieldMatrix4: the matrix is not invertible');

        const detInv = det.clone().invert();

        te[0].copy(t11).multiply(detInv);
        te[1] = new QuadFieldElt()
            .addProduct(n24, n33, n41)
            .subProduct(n23, n34, n41)
            .subProduct(n24, n31, n43)
            .addProduct(n21, n34, n43)
            .addProduct(n23, n31, n44)
            .subProduct(n21, n33, n44)
            .multiply(detInv);
        te[2] = new QuadFieldElt()
            .addProduct(n22, n34, n41)
            .subProduct(n24, n32, n41)
            .addProduct(n24, n31, n42)
            .subProduct(n21, n34, n42)
            .subProduct(n22, n31, n44)
            .addProduct(n21, n32, n44)
            .multiply(detInv);
        te[3] = new QuadFieldElt()
            .addProduct(n23, n32, n41)
            .subProduct(n22, n33, n41)
            .subProduct(n23, n31, n42)
            .addProduct(n21, n33, n42)
            .addProduct(n22, n31, n43)
            .subProduct(n21, n32, n43)
            .multiply(detInv);


        te[4].copy(t12).multiply(detInv);
        te[5] = new QuadFieldElt()
            .addProduct(n13, n34, n41)
            .subProduct(n14, n33, n41)
            .addProduct(n14, n31, n43)
            .subProduct(n11, n34, n43)
            .subProduct(n13, n31, n44)
            .addProduct(n11, n33, n44)
            .multiply(detInv);
        te[6] = new QuadFieldElt()
            .addProduct(n14, n32, n41)
            .subProduct(n12, n34, n41)
            .subProduct(n14, n31, n42)
            .addProduct(n11, n34, n42)
            .addProduct(n12, n31, n44)
            .subProduct(n11, n32, n44)
            .multiply(detInv);
        te[7] = new QuadFieldElt()
            .addProduct(n12, n33, n41)
            .subProduct(n13, n32, n41)
            .addProduct(n13, n31, n42)
            .subProduct(n11, n33, n42)
            .subProduct(n12, n31, n43)
            .addProduct(n11, n32, n43)
            .multiply(detInv);

        te[8].copy(t13).multiply(detInv);
        te[9] = new QuadFieldElt()
            .addProduct(n14, n23, n41)
            .subProduct(n13, n24, n41)
            .subProduct(n14, n21, n43)
            .addProduct(n11, n24, n43)
            .addProduct(n13, n21, n44)
            .subProduct(n11, n23, n44)
            .multiply(detInv);
        te[10] = new QuadFieldElt()
            .addProduct(n12, n24, n41)
            .subProduct(n14, n22, n41)
            .addProduct(n14, n21, n42)
            .subProduct(n11, n24, n42)
            .subProduct(n12, n21, n44)
            .addProduct(n11, n22, n44)
            .multiply(detInv);
        te[11] = new QuadFieldElt()
            .addProduct(n13, n22, n41)
            .subProduct(n12, n23, n41)
            .subProduct(n13, n21, n42)
            .addProduct(n11, n23, n42)
            .addProduct(n12, n21, n43)
            .subProduct(n11, n22, n43)
            .multiply(detInv);

        te[12].copy(t14).multiply(detInv);
        te[13] = new QuadFieldElt()
            .addProduct(n13, n24, n31)
            .subProduct(n14, n23, n31)
            .addProduct(n14, n21, n33)
            .subProduct(n11, n24, n33)
            .subProduct(n13, n21, n34)
            .addProduct(n11, n23, n34)
            .multiply(detInv);
        te[14] = new QuadFieldElt()
            .addProduct(n14, n22, n31)
            .subProduct(n12, n24, n31)
            .subProduct(n14, n21, n32)
            .addProduct(n11, n24, n32)
            .addProduct(n12, n21, n34)
            .subProduct(n11, n22, n34)
            .multiply(detInv);
        te[15] = new QuadFieldElt()
            .addProduct(n12, n23, n31)
            .subProduct(n13, n22, n31)
            .addProduct(n13, n21, n32)
            .subProduct(n11, n23, n32)
            .subProduct(n12, n21, n33)
            .addProduct(n11, n22, n33)
            .multiply(detInv);

        return this;
    }

    /**
     * Check if the two matrices are equal
     * @param {QuadFieldMatrix4} matrix
     * @return {boolean}
     */
    equals(matrix) {
        for (let i = 0; i < 16; i++) {
            if (!this.elements[i].equals(matrix.elements[i])) return false;
        }

        return true;
    }

    /**
     * Set the coefficient from an array
     * @param {QuadFieldElt[]} array
     * @param {number} offset
     * @return {QuadFieldMatrix4}
     */
    fromArray(array, offset = 0) {
        for (let i = 0; i < 16; i++) {
            this.elements[i].copy(array[i + offset]);
        }
        return this;
    }

    /**
     * Return the elements of the matrix as an array
     * @param {QuadFieldElt[]} array
     * @param {number} offset
     * @return {QuadFieldElt[]}
     */
    toArray(array = [], offset = 0) {
        const te = this.elements;

        for (let i = 0; i < 16; i++) {
            array[offset + i].copy(te[i]);
        }
        return array;
    }

    /**
     * Convert the matrix to a Matrix4 (with number type entries)
     * @return {Matrix4}
     */
    toMatrix4() {
        const entries = this.toArray().map(x => x.toNumber());
        return new Matrix4().fromArray(entries);
    }


    /**
     * Return a copy of the current matrix.
     * @return {QuadFieldMatrix4}
     */
    clone() {
        return new QuadFieldMatrix4().fromArray(this.elements);
    }

    /**
     * Set the current matrix to m
     * @param {QuadFieldMatrix4} m
     * @return {QuadFieldMatrix4}
     */
    copy(m) {
        return this.fromArray(m.elements);

    }

    toLog(){
        return this.toMatrix4().toLog();
    }
}