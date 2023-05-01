import {Group as AbstractGroup} from "../../../../core/groups/Group.js";
import {GroupElement} from "./GroupElement.js";
import element from "./shaders/element.glsl";
import struct from "./shaders/struct.glsl";


/**
 * Fundamental group of the Klein bottle x S^1
 */
export class Group extends AbstractGroup {

    /**
     * Constructor
     * @param {number} halfWidth - Half width of the fundamental domain
     */
    constructor(halfWidth = 1) {
        super();
        this._halfWidth = halfWidth;
    }

    get halfWidth() {
        return this._halfWidth;
    }

    set halfWidth(value) {
        this._halfWidth = value;
    }

    element() {
        const x = arguments.length > 0 ? arguments[0] : 0;
        const y = arguments.length > 1 ? arguments[1] : 0;
        const z = arguments.length > 2 ? arguments[2] : 0;
        return new GroupElement(this, x, y, z)
    }

    shader(shaderBuilder) {
        shaderBuilder.addChunk(struct);
        shaderBuilder.addUniform('group', 'Group', this);
        shaderBuilder.addChunk(element);
    }
}