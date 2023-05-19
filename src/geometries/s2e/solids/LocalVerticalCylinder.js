import {Solid} from "../../../core/solids/Solid.js";
import {LocalVerticalCylinderShape} from "../shapes/localVerticalCylinder/LocalVerticalCylinderShape.js";

/**
 * @class
 *
 * @classdesc
 * Vertical cylinder in S2 x E.
 */
export class LocalVerticalCylinder extends Solid {

    /**
     * Constructor
     * @param {Isometry} location - the location of the cylinder
     * @param {number} radius - the radius of the cylinder
     * @param {Material} material - the material of the cylinder
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, radius, material, ptMaterial = undefined) {
        const shape = new LocalVerticalCylinderShape(location, radius);
        super(shape, material, ptMaterial);
    }
}