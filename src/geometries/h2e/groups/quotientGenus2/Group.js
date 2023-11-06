import {Group as AbstractGroup} from "../../../../core/geometry/Group.js";
import {GroupElement} from "./GroupElement.js";
import element from "./shaders/element.glsl";


export class Group extends AbstractGroup {

    /**
     * Constructor.
     * In this group an element is both an element of the lattice of H2 x E
     * (corresponding to a quotient of a genus two surface).
     * and its image in the dihedral group of order 6
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