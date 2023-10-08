import {Group as AbstractGroup} from "../../../../core/groups/Group.js";
import {GroupElement} from "./GroupElement.js";
import element from "./shaders/element.glsl";
import struct from "./shaders/struct.glsl";


/**
 * Fundamental group of the Hantzsche-Wendt manifold
 * The group is contained in the semi-direct product of Z^3 with (Z/2)^2
 * - The group (Z/2)^2 is viewed as the set of triples a = (ax, ay, az) where ax, ay, az belong to {±1} and ax * ay * az = 1
 * - The factor (Z/2)^2 (as described above) acts on Z^3 by pointwise multiplication,
 *      i.e. a·u = (ax * ux, ay * uy, az * uz)
 * A fundamental domain for the action of this group on E^3 is a rhombic dodecahedron
 */
export class Group extends AbstractGroup {

    /**
     * Constructor
     * @param {number} length - a length parameter controlling the size of the fundamental domain
     */
    constructor(length = 1) {
        super();
        this._length = length;
    }

    get length() {
        return this._length;
    }

    set length(value) {
        this._length = value;
    }

    element() {
        return new GroupElement(this)
    }

    shader(shaderBuilder) {
        shaderBuilder.addChunk(struct);
        shaderBuilder.addUniform('group', 'Group', this);
        shaderBuilder.addChunk(element);
    }
}