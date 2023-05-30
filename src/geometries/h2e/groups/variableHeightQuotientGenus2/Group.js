import {Group as AbstractGroup} from "../../../../core/groups/Group.js";
import {GroupElement} from "./GroupElement.js";
import struct from "./shaders/struct.glsl";
import element from "./shaders/element.glsl";


export class Group extends AbstractGroup {

    /**
     * Constructor.
     * In this group an element is both an element of the lattice of H2 x E
     * (corresponding to a quotient of a genus two surface).
     * and its image in the dihedral group of order 6
     * @param {number} halfHeight - half height in the E direction
     */
    constructor(halfHeight = undefined) {
        super();
        this.halfHeight = halfHeight !== undefined ? halfHeight : 1;
    }

    element() {
        return new GroupElement(this);
    }

    shader(shaderBuilder) {
        shaderBuilder.addChunk(struct);
        shaderBuilder.addUniform('group', 'Group', this);
        shaderBuilder.addChunk(element);
    }
}