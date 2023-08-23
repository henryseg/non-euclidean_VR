import {Solid} from "../../../core/solids/Solid.js";
import {LocalZSlabShape} from "../shapes/localZSlab/LocalZSlabShape.js";

/**
 * @class
 *
 * @classdesc
 * Euclidean Half space
 */
export class LocalZSlab extends Solid {

    /**
     * Constructor
     * @param {Isometry} isom - the location of the half space
     * @param {number} thickness - the thickness of the slab
     * @param {Material} material - the material of the half space
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(isom, thickness, material, ptMaterial = undefined) {
        const shape = new LocalZSlab(isom, thickness);
        super(shape, material, ptMaterial);
    }
}