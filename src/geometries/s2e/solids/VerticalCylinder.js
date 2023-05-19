import {Solid} from "../../../core/solids/Solid.js";
import {VerticalCylinderShape} from "../shapes/verticalCylinder/VerticalCylinderShape.js";

/**
 * @class
 *
 * @classdesc
 * Vertical cylinder in S2 x E.
 */
export class VerticalCylinder extends Solid {

    /**
     * Constructor
     * @param {Isometry} location - the location of the cylinder
     * @param {number} radius - the radius of the cylinder
     * @param {Material} material - the material of the cylinder
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, radius, material, ptMaterial = undefined) {
        const shape = new VerticalCylinderShape(location, radius);
        super(shape, material, ptMaterial);
    }
}