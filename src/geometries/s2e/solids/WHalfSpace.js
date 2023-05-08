import {Solid} from "../../../core/solids/Solid.js";
import {WHalfSpaceShape} from "../shapes/wHalfSpace/WHalfSpaceShape.js";

/**
 * @class
 *
 * @classdesc
 * Half space {w < 0}
 */
export class WHalfSpace extends Solid {

    /**
     * Constructor
     * @param {Isometry} location - the location of the half space
     * @param {Material} material - the material of the half space
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, material, ptMaterial = undefined) {
        const shape = new WHalfSpaceShape(location);
        super(shape, material, ptMaterial);
    }
}