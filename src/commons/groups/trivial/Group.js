import {Group as AbstractGroup} from "../../../core/geometry/Group.js";
import {GroupElement} from "./GroupElement.js";

import element from "./shaders/element.glsl";

export class Group extends AbstractGroup {

    constructor() {
        super();
    }

    element() {
        return new GroupElement(this);
    }

    shader(shaderBuilder) {
        shaderBuilder.addChunk(element);
    }
}