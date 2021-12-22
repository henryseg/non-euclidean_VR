import {Solid} from "../../../core/solids/Solid.js";
import {VerticalHalfSpaceShape} from "../shapes/verticalHalfSpace/VerticalHalfSpaceShape.js";

/**
 * @class
 *
 * @classdesc
 * Vertical half space in Nil
 */
export class VerticalHalfSpace extends Solid {
    /**
     * Constructor.
     * @param {Isometry} isom - location of the half space
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(isom, material, ptMaterial = undefined) {
        const shape = new VerticalHalfSpaceShape(isom);
        super(shape, material, ptMaterial);
    }
}