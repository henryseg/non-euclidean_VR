import {Solid} from "../../../core/solids/Solid.js";
import {LocalRoundConeShape} from "../shapes/localRoundCone/LocalRoundConeShape.js";

/**
 * @class
 *
 * @classdesc
 * Hyperbolic cylinder
 */
export class LocalRoundCone extends Solid {

    /**
     * Constructor
     * @param {Isometry} isom - the location of the cone
     * @param {number} radius - the radii of the cone (if a single value is passed, the top and bottom radii are the same)
     * @param {number} height - height of the cylinder
     * @param {Material} material - the material of the cylinder
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(isom, radius, height,  material, ptMaterial = undefined) {
        const shape = new LocalRoundConeShape(isom, radius, height);
        super(shape, material, ptMaterial);
    }
}