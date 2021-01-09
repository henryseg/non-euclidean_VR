import {Group as AbstractGroup} from "../../../core/groups/Group.js";
import {GroupElement} from "./GroupElement.js";

import element from "./shaders/element.js";

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