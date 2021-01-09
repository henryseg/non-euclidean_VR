import {Group as AbstractGroup} from "../../../../core/groups/Group.js";
import {GroupElement} from "./GroupElement.js";
import element from "./shaders/element.js";
import struct from "./shaders/struct.js";


export class Group extends AbstractGroup {

    /**
     * Constructor.
     * @param {number} cubeHalfWidth - half the width of the fundamental domain
     */
    constructor(cubeHalfWidth = 1) {
        super();
        this.cubeHalfWidth = cubeHalfWidth;
    }

    element() {
        const x = arguments.length > 0 ? arguments[0] : 0;
        const y = arguments.length > 1 ? arguments[1] : 0;
        const z = arguments.length > 2 ? arguments[2] : 0;
        return new GroupElement(this, x, y, z)
    }

    shader(shaderBuilder) {
        shaderBuilder.addChunk(struct);
        shaderBuilder.addUniform('group', 'GroupData', this);
        shaderBuilder.addChunk(element);
    }
}