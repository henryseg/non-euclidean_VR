import {Matrix4, Vector4} from "three";

import {Group as AbstractGroup} from "../../../../core/geometry/Group.js";
import {GroupElement} from "./GroupElement.js";

import element from "./shaders/element.glsl";
import struct from "./shaders/struct.glsl";

/**
 * @class
 *
 * @classdesc
 * Heisenberg group
 */
export class Group extends AbstractGroup {

    /**
     * Constructor
     * The two parameters are translation vectors in the xy plane
     * The third vector will be automatically computed as the commutator (in Nil) of the first two
     * @param {Vector4} translationA
     * @param {Vector4} translationB
     */
    constructor(translationA = undefined, translationB = undefined) {
        super();
        /**
         * Translation of the first generator
         * @type {Vector4}
         */
        this._translationA = translationA !== undefined ? translationA : new Vector4(1, 0, 0, 0);
        /**
         * Translation of the second generator
         * @type {Vector4}
         */
        this._translationB = translationB !== undefined ? translationB : new Vector4(0, 1, 0, 0);
        /**
         * Normal to the boundary in the A direction
         * @type {Vector4}
         */
        this._testTranslationA = undefined;
        /**
         * Normal to the boundary in the B direction
         * @type {Vector4}
         */
        this._testTranslationB = undefined;
        /**
         * Normal to the boundary in the C direction
         * @type {Vector4}
         */
        this._testTranslationC = undefined;

        this.updateTranslationC();
        this.updateDotMatrix();
    }


    get translationA() {
        return this._translationA;
    }

    set translationA(value) {
        this._translationA = value !== undefined ? value : new Vector4(1, 0, 0, 0);
        this.updateTranslationC();
        this.updateDotMatrix();
    }

    get testTranslationA() {
        if (this._testTranslationA === undefined) {
            this._testTranslationA = this.translationA.clone().applyMatrix4(this.dotMatrix);
        }
        return this._testTranslationA;
    }


    get translationB() {
        return this._translationB;
    }

    set translationB(value) {
        this._translationB = value !== undefined ? value : new Vector4(0, 1, 0, 0);
        this.updateTranslationC();
        this.updateDotMatrix();
    }

    get testTranslationB() {
        if (this._testTranslationB === undefined) {
            this._testTranslationB = this.translationA.clone().applyMatrix4(this.dotMatrix);
        }
        return this._testTranslationB;
    }

    updateTranslationC() {
        const [xa, ya, za, wa] = this._translationA.toArray();
        const [xb, yb, zb, wb] = this._translationB.toArray();
        this._halfTranslationC = new Vector4(0, 0, xa * yb - xb * ya, 0);
    }

    get translationC() {
        return this._halfTranslationC;
    }

    get testTranslationC() {
        if (this._testTranslationC === undefined) {
            this._testTranslationC = this.translationA.clone().applyMatrix4(this.dotMatrix);
        }
        return this._testTranslationC;
    }

    updateDotMatrix() {
        if (this._dotMatrix === undefined) {
            this._dotMatrix = new Matrix4();
        }
        const aux = new Matrix4().set(
            this.translationA.x, this.translationB.x, this.translationC.x, 0,
            this.translationA.y, this.translationB.y, this.translationC.y, 0,
            this.translationA.z, this.translationB.z, this.translationC.z, 0,
            0, 0, 0, 1
        ).invert();
        this._dotMatrix.copy(aux).transpose().multiply(aux);
        this._testTranslationA = this.translationA.clone().applyMatrix4(this.dotMatrix);
        this._testTranslationB = this.translationB.clone().applyMatrix4(this.dotMatrix);
        this._testTranslationC = this.translationC.clone().applyMatrix4(this.dotMatrix);
    }

    /**
     * Return a positive definite matrix for which the family
     * translationA, translationB, translationC
     * is orthonormal.
     * @type{Matrix4}
     */
    get dotMatrix() {
        return this._dotMatrix;
    }

    element() {
        const x = arguments.length > 0 ? arguments[0] : 0;
        const y = arguments.length > 1 ? arguments[1] : 0;
        const z = arguments.length > 2 ? arguments[2] : 0;
        return new GroupElement(this, x, y, z);
    }

    shader(shaderBuilder) {
        shaderBuilder.addChunk(struct);
        shaderBuilder.addUniform('group', 'Group', this);
        shaderBuilder.addChunk(element);
    }

}