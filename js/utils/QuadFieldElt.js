export let D = -1;

export const setD = function (val) {
    D = val;
}

/**
 * gcd of three numbers
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @return {number}
 */
const gcd = function (a, b, c) {
    if (b === 0 && c === 0) {
        return a;
    }
    if (c === 0) {
        return gcd(b, a % b, c);
    }
    return gcd(c, a % c, b % c);
}

/**
 * @class
 *
 * @classdesc
 * Quadratic extension of Q.
 * Elements of the form (a + b sqrt(D)) where gcd(a,b,c) = 1
 */
export class QuadFieldElt {

    /**
     * Constructor.
     * @param {number} a - an integer
     * @param {number} b - an integer
     * @param {number} c - an integer
     */
    constructor(a = undefined, b = undefined, c = undefined) {
        this.a = a !== undefined ? a : 0;
        this.b = b !== undefined ? b : 0;
        this.c = c !== undefined ? c : 1;
        this.reduce();
    }

    /**
     * Make the that gcd(a,b,c) = 1
     * @return {QuadFieldElt} the current element
     */
    reduce() {
        const n = gcd(this.a, this.b, this.c);
        this.a = Math.round(this.a / n);
        this.b = Math.round(this.b / n);
        this.c = Math.round(this.c / n);
        return this;
    }

    /**
     * Replace the element by its opposite
     * @return {QuadFieldElt} the current element
     */
    negate() {
        this.a = -this.a;
        this.b = -this.b;
        return this;
    }

    /**
     * Multiplication
     * @param {QuadFieldElt} elt
     * @return {QuadFieldElt} the current element
     */
    multiply(elt) {
        const auxA = this.a;
        const auxB = this.b;
        this.a = auxA * elt.a + D * auxB * elt.b;
        this.b = auxA * elt.b + auxB * elt.a;
        this.c = this.c * elt.c;
        return this.reduce();
    }

    /**
     * Addition
     * @param {QuadFieldElt} elt
     * @return {QuadFieldElt} the current element
     */
    add(elt) {
        this.a = this.a * elt.c + elt.a * this.c;
        this.b = this.b * elt.c + elt.b * this.c;
        this.c = this.c * elt.c;
        return this.reduce();
    }

    /**
     * Subtraction
     * @param {QuadFieldElt} elt
     * @return {QuadFieldElt} the current element
     */
    sub(elt) {
        this.a = this.a * elt.c - elt.a * this.c;
        this.b = this.b * elt.c - elt.b * this.c;
        this.c = this.c * elt.c;
        return this.reduce();
    }

    /**
     * Compute the inverse.
     * If the element is not invertible throw an error.
     * @return {QuadFieldElt} the current element
     */
    invert() {
        if (this.a === 0 && this.b === 0) {
            throw new Error('QuadFieldElt: this element is not invertible');
        }
        const auxA = this.a;
        const auxB = this.b;
        this.a = auxA * this.c;
        this.b = -auxB * this.c;
        this.c = auxA * auxA - D * auxB * auxB;
        return this.reduce();
    }

    /**
     * Set the current element to the sum of the given arguments
     * @return {QuadFieldElt} the current element
     */
    sum() {
        this.copy(zero);
        for (const elt of arguments) {
            this.add(elt);
        }
        return this;
    }

    /**
     * Set the currnet element of the product of the given arguments
     * @return {QuadFieldElt} the current element
     */
    product() {
        this.copy(one);
        for (const elt of arguments) {
            this.multiply(elt);
        }
        return this;
    }

    /**
     * Add the product of the given element to the current elements
     * @return {QuadFieldElt} the current element
     */
    addProduct() {
        const aux = new QuadFieldElt().product(...arguments);
        this.add(aux);
        return this;
    }

    /**
     * Subtract the product of the given element to the current elements
     * @return {QuadFieldElt} the current element
     */
    subProduct() {
        const aux = new QuadFieldElt().product(...arguments);
        this.sub(aux);
        return this;
    }

    /**
     * Convert the element to a number
     */
    toNumber() {
        return (this.a + this.b * Math.sqrt(D)) / this.c;
    }

    /**
     * Check if the two element are equal
     * @param {QuadFieldElt} elt
     * @return {boolean}
     */
    equals(elt) {
        return this.a * elt.c === elt.a * this.c && this.b * elt.c === elt.b * this.c;
    }

    /**
     * Test if the element is zero.
     * @return {boolean}
     */
    isZero() {
        return this.a === 0 && this.b === 0;
    }

    /**
     * Return a copy of the current element
     * @return {QuadFieldElt}
     */
    clone() {
        const res = new QuadFieldElt();
        res.a = this.a;
        res.b = this.b;
        res.c = this.c;
        return res;
    }

    /**
     * Set the current element to the given one
     * @param {QuadFieldElt} elt
     * @return {QuadFieldElt} the current element
     */
    copy(elt) {
        this.a = elt.a;
        this.b = elt.b;
        this.c = elt.c;
        return this;
    }
}

export const one = new QuadFieldElt(1);
export const zero = new QuadFieldElt(0);