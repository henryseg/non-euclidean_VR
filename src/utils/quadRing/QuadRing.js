import {QuadRingElement} from "./QuadRingElement.js";
import quadRing from "./shader/quadRing.glsl";
import {QuadRingMatrix4} from "./QuadRingMatrix4.js";

/**
 * @class
 *
 * @classdesc
 * Quadratic field.
 * Mostly a structure to store the square of the adjoined root
 */
export class QuadRing {

    /**
     * Constructor
     * @param {number} d - the square of the adjoined root.
     * For the moment it should be an integer
     */
    constructor(d) {
        this.d = d;
    }

    /**
     * Return the element a + b sqrt(d) in the quadratic ring.
     * `a` and `b` should be integers
     * @param {number} a
     * @param {number} b
     */
    element(a = 0, b = 0) {
        return new QuadRingElement(this, a, b);
    }

    /**
     * Return a matrix on this quadratic rign
     * @return {QuadRingMatrix4}
     */
    matrix4(){
        return new QuadRingMatrix4(this);
    }

    get one() {
        return new QuadRingElement(this, 1);
    }

    get zero() {
        return new QuadRingElement(this, 0);
    }

    /**
     * build the corresponding part of the shader
     * @param {ShaderBuilder} shaderBuilder
     */
    shader(shaderBuilder) {
        shaderBuilder.addChunk(quadRing);
        shaderBuilder.addConstant('QUAD_RING_D', 'int', this.d);
    }
}