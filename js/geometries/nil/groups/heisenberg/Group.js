import {Matrix4, Vector4} from "../../../../lib/threejs/build/three.module.js";

import {Group as AbstractGroup} from "../../../../core/groups/Group.js";
import {GroupElement} from "./GroupElement.js";

import element from "./shaders/element.js";
import struct from "./shaders/struct.js";

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
        this.updateTranslationC();
        this.updateDotMatrix();
        console.log("Dot matrix", this.dotMatrix);
        console.log("Dot matrix", this.dotMatrix.toLog());
    }


    get translationA() {
        return this._translationA;
    }

    set translationA(value) {
        this._translationA = value !== undefined ? value : new Vector4(1, 0, 0, 0);
        this.updateTranslationC();
        this.updateDotMatrix();
    }


    get translationB() {
        return this._translationB;
    }

    set translationB(value) {
        this._translationB = value !== undefined ? value : new Vector4(0, 1, 0, 0);
        this.updateTranslationC();
        this.updateDotMatrix();
    }

    updateTranslationC() {
        const [xa, ya, za, wa] = this._translationA.toArray();
        const [xb, yb, zb, wb] = this._translationB.toArray();
        this._halfTranslationC = new Vector4(0, 0, xa * yb - xb * ya, 0);
    }

    get translationC() {
        return this._halfTranslationC;
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