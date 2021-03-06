import {Group as AbstractGroup} from "../../../../core/groups/Group.js";
import {GroupElement} from "./GroupElement.js";
import {QuadRing} from "../../../../utils/quadRing/QuadRing.js";

import element from "./shaders/element.js";
import quadRingMatrix from "../../../../utils/quadRing/shader/quadRingMatrix.js";

export const QUAD_RING = new QuadRing(3);

export class Group extends AbstractGroup {

    constructor() {
        super();
    }

    element() {
        return new GroupElement(this);
    }

    shader(shaderBuilder) {
        QUAD_RING.shader(shaderBuilder);
        shaderBuilder.addChunk(quadRingMatrix);
        shaderBuilder.addChunk(element);
    }
}