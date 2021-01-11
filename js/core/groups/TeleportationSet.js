import relative from "./shaders/relative.js";
import {mustache} from "../../lib/mustache.mjs";
import teleport from "./shaders/teleport.js";
import {Group as TrivialGroup} from "../../commons/groups/trivial/Group.js";

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
     * @param {{elt:GroupElement, inv:GroupElement}[]} neighbors - the list of neighbors when using nearest neighbors.
     * The elements come by pair : an element and its inverse.
     * defining the structure of the group element and the related functions
     * @param {boolean} usesNearestNeighbors
     */
    constructor(
        teleportations = [],
        neighbors = [],
        usesNearestNeighbors = false
    ) {
        /**
         * The list of teleports "generating" the subgroups.
         * The order matters (see the class description).
         * @type {Teleportation[]}
         */
        this.teleportations = teleportations;
        /**
         * Shortcut to the underlying group.
         * If the list of teleportations is empty, use the trivial group.
         * @type {Group}
         */
        this.group = undefined
        if (teleportations.length !== 0) {
            this.group = teleportations[0].elt.group;
        } else {
            this.group = new TrivialGroup();
        }
        /**
         * The list of neighbors when using nearest neighbors.
         * @type{{elt:GroupElement, inv:GroupElement}[]}
         */
        this.neighbors = neighbors;
        /**
         * Flag : uses nearest neighbor or not (for local ray marching)
         * @type{boolean}
         */
        this.usesNearestNeighbors = usesNearestNeighbors;
    }

    /**
     * Goes through all the teleportations in the discrete subgroup
     * and build the GLSL code performing the associated test.
     * @param {ShaderBuilder} shaderBuilder
     */
    shader(shaderBuilder) {
        this.group.shader(shaderBuilder);
        for (const teleportation of this.teleportations) {
            teleportation.shader(shaderBuilder);
        }
        for (const pair of this.neighbors) {
            shaderBuilder.addUniform(pair.elt.name, 'GroupElement', pair.elt);
            shaderBuilder.addUniform(pair.inv.name, 'GroupElement', pair.inv);
        }
        shaderBuilder.addChunk(relative);
        shaderBuilder.addChunk(mustache.render(teleport, this));
    }

}