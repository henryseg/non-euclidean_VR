import {Matrix3} from "three";

import {Group as AbstractGroup} from "../../../../core/groups/Group.js";
import {GroupElement} from "./GroupElement.js";

import element from "./shaders/element.glsl";

export const PHI = 0.5 * (1 + Math.sqrt(5))
export const DENUM = 1 / (PHI + 2);

/**
 * @class
 * @classdesc
 * Subgroup Z^2 inside the suspension of Z^2 by the Anosov matrix A = [[2,1],[1,1]].
 * (See mappingTorus group)
 * See GroupElement for the description of the representation
 */
export class Group extends AbstractGroup {

    /**
     * Constructor
     * The two parameters are translation vectors in the xy plane
     */
    constructor() {
        super();
    }

    element() {
        const x = arguments.length > 0 ? arguments[0] : 0;
        const y = arguments.length > 1 ? arguments[1] : 0;
        return new GroupElement(this, x, y);
    }

    shader(shaderBuilder) {
        shaderBuilder.addChunk(element);
    }

}