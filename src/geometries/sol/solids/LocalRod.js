import {Solid} from "../../../core/solids/Solid.js";
import {LocalRodShape} from "../shapes/localRod/LocalRodShape.js";

/**
 * @class
 *
 * @classdesc
 * Local Rod in Sol
 */
export class LocalRod extends Solid {
    /**
     * Constructor.
     * @param {Isometry|Point} location - the location of the rod
     * @param {Vector2|number} sides - the half width of the rod
     * @param {number} smoothness - smoothness parameter
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, sides, smoothness, material, ptMaterial = undefined) {
        const shape = new LocalRodShape(location, sides, smoothness);
        super(shape, material, ptMaterial);
    }
}