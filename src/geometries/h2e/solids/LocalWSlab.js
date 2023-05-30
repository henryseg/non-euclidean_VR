import {Solid} from "../../../core/solids/Solid.js";
import {LocalWSlabShape} from "../shapes/localWSlab/LocalWSlabShape.js";

/**
 * @class
 *
 * @classdesc
 * Slab {|w| < thickness}
 */
export class LocalWSlab extends Solid {

    /**
     * Constructor
     * @param {Isometry} location - the location of the half space
     * @param {number} thickness - thickness of the slab
     * @param {Material} material - the material of the half space
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, thickness, material, ptMaterial = undefined) {
        const shape = new LocalWSlabShape(location, thickness);
        super(shape, material, ptMaterial);
    }
}