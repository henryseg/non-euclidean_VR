import {Solid} from "../../../core/solids/Solid.js";

import {VerticalCylinderShape} from "../shapes/verticalCylinder/VerticalCylinderShape.js";

/**
 * @class
 *
 * @classdesc
 * Vertical cylinder in Nil
 */
export class VerticalCylinder extends Solid {
    /**
     * Constructor.
     * @param {Isometry} isom - the isometry locating the cylinder
     * @param {number} radius - the radius of the cylinder
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(isom, radius, material, ptMaterial = undefined) {
        const shape = new VerticalCylinderShape(isom, radius);
        super(shape, material, ptMaterial);
    }
}