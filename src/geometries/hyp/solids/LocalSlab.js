import {Solid} from "../../../core/solids/Solid.js";
import {SlabShape} from "../shapes/slab/SlabShape.js";

/**
 * @class
 *
 * @classdesc
 * Hyperbolic slab around a hyperbolic plane
 */
export class LocalSlab extends Solid {

    /**
     * Constructor
     * @param {Isometry} isom - the isometry defining location of the slab
     * @param {number} thickness - the thickness of the slab
     * @param {Material} material - the material of the solid
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(isom, thickness, material, ptMaterial = undefined) {
        const shape = new SlabShape(isom, thickness);
        super(shape, material, ptMaterial);
    }
}