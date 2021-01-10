import {Group as AbstractGroup} from "../../../../core/groups/Group.js";
import {GroupElement} from "./GroupElement.js";
import element from "./shaders/element.js";
import struct from "./shaders/struct.js";
import {Vector4} from "../../../../lib/three.module.js";


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
        this.halfTranslationA = halfTranslationA;
        /**
         * Translation of the second generator
         * @type {Vector4}
         */
        this.halfTranslationB = halfTranslationB;
        /**
         * Translation of the third generator
         * @type {Vector4}
         */
        this.halfTranslationC = halfTranslationC;
    }

    get halfTranslationA() {
        return this._halfTranslationA;
    }

    set halfTranslationA(value) {
        this._halfTranslationA = value !== undefined ? value : new Vector4(1, 0, 0, 0);
        this._halfLengthSqA = this._halfTranslationA.lengthSq();
    }

    get halfLengthSqA() {
        return this._halfLengthSqA;
    }

    get halfTranslationB() {
        return this._halfTranslationB;
    }

    set halfTranslationB(value) {
        this._halfTranslationB = value !== undefined ? value : new Vector4(0, 1, 0, 0);
        this._halfLengthSqB = this._halfTranslationB.lengthSq();
    }

    get halfLengthSqB() {
        return this._halfLengthSqB;
    }


    get halfTranslationC() {
        return this._halfTranslationC;
    }

    set halfTranslationC(value) {
        this._halfTranslationC = value !== undefined ? value : new Vector4(0, 0, 1, 0);
        this._halfLengthSqC = this._halfTranslationC.lengthSq();
    }

    get halfLengthSqC() {
        return this._halfLengthSqC;
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