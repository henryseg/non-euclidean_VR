import {GroupElement} from "./GroupElement.js";

/**
 * @class
 * @abstract
 * @classdesc
 * Group (in the mathematical sense).
 * This class is mainly a contained to receive the data common to all elements of the group.
 */
export class Group {
    /**
     * Constructor
     */
    constructor() {
    }

    /**
     * Create an element in the group.
     * If no data is passed it should be the identity.
     * @abstract
     * @return {GroupElement}
     */
    element() {
        throw new Error('Group: this method should be implemented');
    }

    /**
     * Build the shader associated to the group.
     * @abstract
     * @param {ShaderBuilder} shaderBuilder
     */
    shader(shaderBuilder) {
        throw new Error('Group: this method should be implemented');
    }
}