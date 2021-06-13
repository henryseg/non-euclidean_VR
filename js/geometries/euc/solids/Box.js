import {Solid} from "../../../core/solids/Solid.js";
import {BoxShape} from "../shapes/box/BoxShape.js";

/**
 * @class
 *
 * @classdesc
 * Euclidean box
 */
export class Box extends Solid {

    /**
     * Constructor
     * @param {Isometry|Point} location - the location of the ball
     * @param {Vector3} sides - the side lengths of the box
     * @param {number} rounded - the if the box is rounded
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, sides, rounded,material, ptMaterial = undefined) {
        const shape = new BoxShape(location, sides, rounded);
        super(shape, material, ptMaterial);
    }
}