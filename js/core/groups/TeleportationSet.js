import relative from "./shaders/relative.js";
import {mustache} from "../../lib/mustache.mjs";
import teleport from "./shaders/teleport.js";

/**
 * @class
 *
 * @classdesc
 * Set of teleportations.
 * It implicitly a set of generators of a discrete subgroup and a fundamental domain for this subgroup
 */
export class TeleportationSet {


    /**
     * Constructor
     * @param {Teleportation[]} teleportations - the list of teleportations.
     * @param {string} eltStruct - chunk of GLSL code
     * defining the structure of the group element and the related functions
     */
    constructor(teleportations, eltStruct) {
        /**
         * The list of teleports "generating" the subgroups.
         * The order matters (see the class description).
         * @type {Teleportation[]}
         */
        this.teleportations = teleportations;
        this.eltStruct = eltStruct;
    }

    /**
     * Goes through all the teleportations in the discrete subgroup
     * and build the GLSL code performing the associated test.
     * @param {ShaderBuilder} shaderBuilder
     */
    shader(shaderBuilder) {
        shaderBuilder.addChunk(this.eltStruct);
        for (const teleportation of this.teleportations) {
            teleportation.shader(shaderBuilder);
        }
        shaderBuilder.addChunk(relative);
        shaderBuilder.addChunk(mustache.render(teleport, this));
    }

}