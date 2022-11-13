import {Group as AbstractGroup} from "../../../../core/groups/Group.js";
import {GroupElement} from "./GroupElement.js";

import element from "./shaders/element.glsl";
import struct from "./shaders/struct.glsl";
import {Matrix4, Vector4} from "three";


/**
 * @class
 * @classdesc
 * Subgroup Z^2 in Sol corresponding to two vectors in the xy-plane
 * See GroupElement for the description of the representation
 */
export class Group extends AbstractGroup {

    /**
     * Constructor
     * @param {Vector4} dirA - the first vector in the xy-plane
     * @param {Vector4} dirB - the first vector in the xy-plane
     */
    constructor(dirA, dirB) {
        super();
        this._dirA = dirA;
        this._dirB = dirB;
        this.updateDotMatrix();
    }

    get dirA() {
        return this._dirA;
    }

    set dirA(value) {
        this._dirA = value !== undefined ? value : new Vector4(1, 0, 0, 0);
        this.updateDotMatrix();
    }

    get dirB() {
        return this._dirB;
    }

    set dirB(value) {
        this._dirB = value !== undefined ? value : new Vector4(0, 1, 0, 0);
        this.updateDotMatrix();
    }

    updateDotMatrix() {
        if (this._dotMatrix === undefined) {
            this._dotMatrix = new Matrix4();
        }
        const aux = new Matrix4().set(
            this.dirA.x, this.dirB.x, 0, 0,
            this.dirA.y, this.dirB.y, 0, 0,
            0, 0, 1, 0,
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
        return new GroupElement(this, x, y);
    }

    shader(shaderBuilder) {
        shaderBuilder.addChunk(struct);
        shaderBuilder.addUniform('group', 'Group', this);
        shaderBuilder.addChunk(element);
    }
}