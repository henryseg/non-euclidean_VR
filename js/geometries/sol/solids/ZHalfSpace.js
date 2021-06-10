import {Solid} from "../../../core/solids/Solid.js";
import {ZHalfSpaceShape} from "../shapes/zHalfSpace/ZHalfSpaceShape.js";

/**
 * @class
 *
 * @classdesc
 * Euclidean Half space
 */
export class ZHalfSpace extends Solid {

    /**
     * Constructor
     * @param {Isometry} isom - the location of the half space
     * @param {Material} material - the material of the half space
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(isom, material, ptMaterial = undefined) {
        const shape = new ZHalfSpaceShape(isom);
        super(shape, material, ptMaterial);
    }
}