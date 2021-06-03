import {Matrix4, Vector4} from "../../../../lib/threejs/build/three.module.js";

import {Group as AbstractGroup} from "../../../../core/groups/Group.js";
import {GroupElement} from "./GroupElement.js";

import element from "./shaders/element.js";

/**
 * @class
 *
 * @classdesc
 * Basic version of the Heisenberg group
 */
export class Group extends AbstractGroup {

    /**
     * Constructor
     */
    constructor() {
        super();
    }

    element() {
        const x = arguments.length > 0 ? arguments[0] : 0;
        const y = arguments.length > 1 ? arguments[1] : 0;
        const z = arguments.length > 2 ? arguments[2] : 0;
        return new GroupElement(this, x, y, z);
    }

    shader(shaderBuilder) {
        shaderBuilder.addChunk(element);
    }

}