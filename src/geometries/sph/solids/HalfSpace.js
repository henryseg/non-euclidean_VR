import {Solid} from "../../../core/solids/Solid.js";
import {HalfSpaceShape} from "../shapes/halfSpace/HalfSpaceShape.js";

/**
 * @class
 *
 * @classdesc
 * Half space
 */
export class HalfSpace extends Solid {

    /**
     * Constructor
     * @param {Isometry} location - the location of the half space
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, material, ptMaterial = undefined) {
        const shape = new HalfSpaceShape(location);
        super(shape, material, ptMaterial);
    }
}