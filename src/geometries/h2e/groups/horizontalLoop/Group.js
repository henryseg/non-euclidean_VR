import {Vector4} from "three";

import {Group as AbstractGroup} from "../../../../core/geometry/Group.js";
import {GroupElement} from "./GroupElement.js";
import element from "./shaders/element.glsl";
import struct from "./shaders/struct.glsl";


export class Group extends AbstractGroup {

    /**
     * Constructor.
     * @param {Vector4} halfTranslation - direction of the half translation at the origin
     * only the x,y coordinates matter… (the other two will be automatically set to zero).
     */
    constructor(halfTranslation = undefined) {
        super();
        /**
         * Half translation vector
         * @type {Vector4}
         */
        this._halfTranslation = halfTranslation !== undefined ? halfTranslation : new Vector4(1, 0, 0, 0);
        this._halfTranslation.setZ(0).setW(0);
    }

    get halfTranslation() {
        return this._halfTranslation;
    }

    set halfTranslation(value) {
        this._halfTranslation = value !== undefined ? value : new Vector4(1, 0, 0, 0);
        this._halfTranslation.setZ(0).setW(0);
    }

    get normalP() {
        const t = this.halfTranslation.length();
        return new Vector4(
            this.halfTranslation.x,
            this.halfTranslation.y,
            -Math.tanh(t) * t,
            0
        );
    }

    get normalN() {
        const t = this.halfTranslation.length();
        return new Vector4(
            this.halfTranslation.x,
            this.halfTranslation.y,
            Math.tanh(t) * t,
            0
        );
    }

    element() {
        const n = arguments.length > 0 ? arguments[0] : 0;
        return new GroupElement(this, n)
    }

    shader(shaderBuilder) {
        shaderBuilder.addChunk(struct);
        shaderBuilder.addUniform('group', 'Group', this);
        shaderBuilder.addChunk(element);
    }
}