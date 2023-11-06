import {Matrix3} from "three";

import {Group as AbstractGroup} from "../../../../core/geometry/Group.js";
import {GroupElement} from "./GroupElement.js";

import struct from "./shaders/struct.glsl";
import element from "./shaders/element.glsl";

export const A = new Matrix3().set(
    2, 1, 0,
    1, 1, 0,
    0, 0, 1
);
export const PHI = 0.5 * (1 + Math.sqrt(5))
export const DENUM = 1 / (PHI + 2);
export const TAU = 2 * Math.log(PHI);

/**
 * @class
 * @classdesc
 * Suspension of Z^2 by Z
 * See GroupElement for the description of the representation
 */
export class Group extends AbstractGroup {

    /**
     * Constructor
     * The two parameters are translation vectors in the xy plane
     * @param {number} length - a parameter controlling the size of the fundamental domain
     */
    constructor(length = 1) {
        super();
        this.length = length;
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