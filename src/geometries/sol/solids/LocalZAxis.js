import {Solid} from "../../../core/solids/Solid.js";
import {LocalZAxisShape} from "../shapes/localZAxis/LocalZAxisShape.js";

/**
 * @class
 *
 * @classdesc
 * Local Rod in Sol
 */
export class LocalZAxis extends Solid {
    /**
     * Constructor.
     * @param {Isometry|Point} location - the location of the rod
     * @param {Vector2|number} sides - the half width of the rod
     * @param {number} smoothness - smoothness parameter
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, sides, smoothness, material, ptMaterial = undefined) {
        const shape = new LocalZAxisShape(location, sides, smoothness);
        super(shape, material, ptMaterial);
    }
}