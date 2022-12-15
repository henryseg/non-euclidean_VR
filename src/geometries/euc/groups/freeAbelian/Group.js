import {Matrix4, Vector4} from "three";

import {Group as AbstractGroup} from "../../../../core/groups/Group.js";
import {GroupElement} from "./GroupElement.js";
import element from "./shaders/element.glsl";
import struct from "./shaders/struct.glsl";



export class Group extends AbstractGroup {

    /**
     * Constructor.
     * @param {Vector4} halfTranslationA
     * @param {Vector4} halfTranslationB
     * @param {Vector4} halfTranslationC
     */
    constructor(halfTranslationA = undefined, halfTranslationB = undefined, halfTranslationC = undefined) {
        super();
        /**
         * Translation of the first generator
         * @type {Vector4}
         */
        this._halfTranslationA = halfTranslationA !== undefined ? halfTranslationA : new Vector4(1, 0, 0, 0);
        /**
         * Translation of the second generator
         * @type {Vector4}
         */
        this._halfTranslationB = halfTranslationB !== undefined ? halfTranslationB : new Vector4(0, 1, 0, 0);
        /**
         * Translation of the third generator
         * @type {Vector4}
         */
        this._halfTranslationC = halfTranslationC !== undefined ? halfTranslationC : new Vector4(0, 0, 1, 0);
        this.updateDotMatrix();
    }

    get halfTranslationA() {
        return this._halfTranslationA;
    }

    set halfTranslationA(value) {
        this._halfTranslationA = value !== undefined ? value : new Vector4(1, 0, 0, 0);
        this.updateDotMatrix();
    }


    get halfTranslationB() {
        return this._halfTranslationB;
    }

    set halfTranslationB(value) {
        this._halfTranslationB = value !== undefined ? value : new Vector4(0, 1, 0, 0);
        this.updateDotMatrix();
    }


    get halfTranslationC() {
        return this._halfTranslationC;
    }

    set halfTranslationC(value) {
        this._halfTranslationC = value !== undefined ? value : new Vector4(0, 0, 1, 0);
        this.updateDotMatrix();
    }

    updateDotMatrix() {
        if (this._dotMatrix === undefined) {
            this._dotMatrix = new Matrix4();
        }
        const aux = new Matrix4().set(
            this.halfTranslationA.x, this.halfTranslationB.x, this.halfTranslationC.x, 0,
            this.halfTranslationA.y, this.halfTranslationB.y, this.halfTranslationC.y, 0,
            this.halfTranslationA.z, this.halfTranslationB.z, this.halfTranslationC.z, 0,
            0, 0, 0, 1
        ).invert();
        this._dotMatrix.copy(aux).transpose().multiply(aux);
    }

    /**
     * Return a positive definite matrix for which the family
     * halfTranslationA, halfTranslationB, halfTranslationC
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
        return new GroupElement(this, x, y, z)
    }

    shader(shaderBuilder) {
        shaderBuilder.addChunk(struct);
        shaderBuilder.addUniform('group', 'Group', this);
        shaderBuilder.addChunk(element);
    }
}