import {Solid} from "../../../core/solids/Solid.js";
import {LocalCappedCylinderShape} from "../shapes/localCappedCylinder/LocalCappedCylinderShape.js";

/**
 * @class
 *
 * @classdesc
 * Hyperbolic cylinder
 */
export class LocalCappedCylinder extends Solid {

    /**
     * Constructor
     * @param {Isometry} isom - the location of the cone
     * @param {number} radius - the radii of the cone (if a single value is passed, the top and bottom radii are the same)
     * @param {number} height - height of the cylinder
     * @param {number} smoothness - smoothness of the edge (polynomial smooth max)
     * @param {Material} material - the material of the cylinder
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(isom, radius, height, smoothness, material, ptMaterial = undefined) {
        const shape = new LocalCappedCylinderShape(isom, radius, height, smoothness);
        super(shape, material, ptMaterial);
    }
}