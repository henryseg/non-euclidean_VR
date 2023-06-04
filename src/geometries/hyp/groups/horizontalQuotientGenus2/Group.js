import {Group as AbstractGroup} from "../../../../core/groups/Group.js";
import {GroupElement} from "./GroupElement.js";
import element from "./shaders/element.glsl";


export class Group extends AbstractGroup {

    /**
     * Constructor
     * Lattice in the stabilizer of the {z = 0} hyperplane
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