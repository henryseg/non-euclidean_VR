import {Solid} from "../../../core/solids/Solid.js";
import {DirectedVerticalHalfSpaceShape} from "../shapes/directedVerticalHalfSpace/DirectedVerticalHalfSpaceShape.js";

/**
 * @class
 *
 * @classdesc
 * Vertical half space in Nil
 */
export class DirectedVerticalHalfSpace extends Solid {
    /**
     * Constructor.
     * @param {Isometry} isom - location of the half space
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(isom, material, ptMaterial = undefined) {
        const shape = new DirectedVerticalHalfSpaceShape(isom);
        super(shape, material, ptMaterial);
    }
}