/**
 * Greatest common divisor
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
const gcd = function (a, b) {
    if (b === 0) {
        return a;
    }
    return gcd(b, a % b);
}

/**
 * @class
 *
 * @classdesc
 * Field of rational numbers
 */
export class Rational {
    /**
     * Constructor.
     * @param {number} num - numerator
     * @param {number} den - denominator
     */
    constructor(num = undefined, den = undefined) {
        this.num = num !== undefined ? num : 0;
        this.den = den !== undefined ? den : 1;
    }

    /**
     * Make the that the numerator and the denominator are co-prime
     * @return {Rational} the current rational
     */
    reduce() {
        const d = gcd(this.num, this.den);
        this.num = this.num / d;
        this.den = this.den / d;
        return this;
    }

    /**
     * Multiply the current rational with r
     * @param {Rational} r
     * @return {Rational} the current rational
     */
    multiply(r) {
        this.num = this.num * r.num;
        this.den = this.den * r.den;
        return this.reduce();
    }

    /**
     * Add r to the current rational
     * @param {Rational} r
     * @return {Rational} the current rational
     */
    add(r) {
        this.num = this.num * r.den + r.num * this.den;
        this.den = this.den * r.den;
        return this.reduce();
    }

    /**
     * Subtract r from the current rational
     * @param {Rational} r
     * @return {Rational} the current rational
     */
    sub(r) {
        this.num = this.num * r.den - r.num * this.den;
        this.den = this.den * r.den;
        return this.reduce();
    }

    /**
     * Check if two rationals are equals
     * @param {Rational} r
     * @return {boolean}
     */
    equals(r) {
        return this.num * r.den === r.num * this.den;
    }

    /**
     * Return a copy of the current rational
     * @return {Rational}
     */
    clone() {
        const res = new Rational();
        res.num = this.num;
        res.den = this.den;
        return res;
    }

    /**
     * Set the current rational to r
     * @param {Rational} r
     * @return {Rational} the current rational
     */
    copy(r) {
        this.num = r.num;
        this.den = r.den;
        return this;
    }
}