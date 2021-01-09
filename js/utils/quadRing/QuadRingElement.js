/**
 * @class
 *
 * @classdesc
 * Elements of the form a + b sqrt(d) where `d` is defined at the level of the `QuadRing`
 */
export class QuadRingElement {

    /**
     * Constructor.
     * @param {QuadRing} ring - the underlying quadratic ring
     * @param {number} a - an integer
     * @param {number} b - an integer
     */
    constructor(ring, a = 0, b = 0) {
        /**
         * The underlying quadratic ring
         * @type {QuadRing}
         */
        this.ring = ring;
        this.a = a;
        this.b = b;
        this.reduce();
    }

    /**
     * Make the that gcd(a,b,c) = 1
     * @return {QuadRingElement} the current element
     */
    reduce() {
        this.a = Math.round(this.a);
        this.b = Math.round(this.b);
        return this;
    }

    /**
     * Replace the element by its opposite
     * @return {QuadRingElement} the current element
     */
    negate() {
        this.a = -this.a;
        this.b = -this.b;
        return this;
    }

    /**
     * Multiplication
     * @param {QuadRingElement} elt
     * @return {QuadRingElement} the current element
     */
    multiply(elt) {
        const auxA = this.a;
        const auxB = this.b;
        this.a = auxA * elt.a + this.ring.d * auxB * elt.b;
        this.b = auxA * elt.b + auxB * elt.a;
        return this.reduce();
    }

    /**
     * Addition
     * @param {QuadRingElement} elt
     * @return {QuadRingElement} the current element
     */
    add(elt) {
        this.a = this.a + elt.a;
        this.b = this.b + elt.b;
        return this.reduce();
    }

    /**
     * Subtraction
     * @param {QuadRingElement} elt
     * @return {QuadRingElement} the current element
     */
    sub(elt) {
        this.a = this.a - elt.a;
        this.b = this.b - elt.b;
        return this.reduce();
    }

    /**
     * Set the current element to the sum of the given arguments
     * @return {QuadRingElement} the current element
     */
    sum() {
        this.copy(this.ring.zero);
        for (const elt of arguments) {
            this.add(elt);
        }
        return this;
    }

    /**
     * Set the current element of the product of the given arguments
     * @return {QuadRingElement} the current element
     */
    product() {
        this.copy(this.ring.one);
        for (const elt of arguments) {
            this.multiply(elt);
        }
        return this;
    }

    /**
     * Add the product of the given element to the current elements
     * @return {QuadRingElement} the current element
     */
    addProduct() {
        const aux = new QuadRingElement(this.ring).product(...arguments);
        this.add(aux);
        return this;
    }

    /**
     * Subtract the product of the given element to the current elements
     * @return {QuadRingElement} the current element
     */
    subProduct() {
        const aux = new QuadRingElement(this.ring).product(...arguments);
        this.sub(aux);
        return this;
    }

    /**
     * Convert the element to a number
     */
    toNumber() {
        return this.a + this.b * Math.sqrt(this.ring.d);
    }

    /**
     * Check if the two element are equal
     * @param {QuadRingElement} elt
     * @return {boolean}
     */
    equals(elt) {
        return this.a === elt.a && this.b === elt.b;
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
     * @return {QuadRingElement}
     */
    clone() {
        const res = new QuadRingElement(this.ring);
        res.a = this.a;
        res.b = this.b;
        return res;
    }

    /**
     * Set the current element to the given one
     * @param {QuadRingElement} elt
     * @return {QuadRingElement} the current element
     */
    copy(elt) {
        this.a = elt.a;
        this.b = elt.b;
        return this;
    }
}
