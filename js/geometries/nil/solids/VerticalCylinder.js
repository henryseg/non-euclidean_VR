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
     */
    constructor(isom, radius, material) {
        const shape = new VerticalCylinderShape(isom, radius);
        super(shape, material);
    }
}