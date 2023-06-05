import {Group as AbstractGroup} from "../../../../core/groups/Group.js";
import {GroupElement} from "./GroupElement.js";
import element from "./shaders/element.glsl";


export class Group extends AbstractGroup {

    /**
     * Constructor
     * Same group as the cube, but with image in a finite quotient
     */
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