import {mustache} from "../../lib/mustache.mjs";
import subgroup from "./shaders/subgroup.js";
import relative from "./shaders/relative.js";

/**
 * @class
 *
 * @classdesc
 * We describe a discrete subgroups by a set of generator.
 * Each generator is seen as a teleportation (to move a point back in the fundamental domain).
 * Thus a discrete subgroups is described by a list of teleportations.
 * The order of those teleportations is the order in which the teleportation are performed.
 * This plays an important role if the discrete subgroups is not abelian.
 *
 *
 * A possible extension would be to implement a symbolic representation of the elements in the subgroup.
 * For the lattices we implemented in E^3, S^3, S^2 x E, Nil and Sol this is probably easy. Indeed
 * - E^3, the lattice will be a semi-direct product of Z^2 by a finite group.
 * - S^3 the lattice is a finite group
 * - S^2 x E the lattice is the product of a finite group and Z
 * - Nil and Sol, the lattices we used are semi-direct product of Z^2 and Z
 * In those case we still need to define our own structures : OpenGL does not handle integer matrices for instance.
 *
 * For H^3, H^2 x E and SL(2,R) this is not that obvious : OpenGL does not seem to handle strings.
 * One possibility would be to find a representations of those groups in GL(n, A) where A is a number field.
 * We could define our structures to handle formally this number field (probably not too bad in terms of performances)
 * And then matrices in this number field.
 * The advantage (compare to a word representation) are the following:
 * - Going from the symbolic representation to the actual Isometry would be straightforward.
 * - Checking the equality of tow elements in the lattice should be straight forward.
 *
 * @todo Implement a more combinatorial representation of elements in the discrete subgroups.
 */
class Subgroup {
    /**
     * Constructor
     * @param {Teleport[]} teleports - the list of teleports "generating" the subgroups.
     */
    constructor(teleports) {
        /**
         * The list of teleports "generating" the subgroups.
         * The order matters (see the class description).
         * @type {Array<Teleport>}
         */
        this.teleports = teleports;
    }

    /**
     * Goes through all the teleportations in the discrete subgroup
     * and build the GLSL code performing the associated test.
     * @oaram {ShaderBuilder} shaderBuilder
     */
    shader(shaderBuilder) {
        for (const teleport of this.teleports) {
            shaderBuilder.addChunk(teleport.glslTest);
            shaderBuilder.addUniform(`${teleport.name}Isom`, 'Isometry', teleport.isom);
            shaderBuilder.addUniform(`${teleport.name}Inv`, 'Isometry', teleport.inv);
        }
        shaderBuilder.addChunk(relative);
        shaderBuilder.addChunk(mustache.render(subgroup, this));
    }

}

export {Subgroup}

