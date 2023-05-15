import {Solid} from "../../../core/solids/Solid.js";
import {LocalHorizontalCylinderShape} from "../shapes/localHorizontalCylinder/LocalHorizontalCylinderShape.js";

/**
 * @class
 *
 * @classdesc
 * Horizontal cylinder in H2 x E.
 */
export class LocalHorizontalCylinder extends Solid {

    /**
     * Constructor
     * @param {Isometry} location - the location of the cylinder
     * @param {number} radius - the radius of the cylinder
     * @param {Material} material - the material of the cylinder
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, radius, material, ptMaterial = undefined) {
        const shape = new LocalHorizontalCylinderShape(location, radius);
        super(shape, material, ptMaterial);
    }
}