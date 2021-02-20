import {Solid} from "../../../core/solids/Solid.js";

import {LocalVerticalCylinderShape} from "../shapes/localVerticalCylinder/LocalVerticalCylinderShape.js";

/**
 * @class
 *
 * @classdesc
 * Vertical cylinder in Nil
 */
export class LocalVerticalCylinder extends Solid {
    /**
     * Constructor.
     * @param {Isometry} isom - the isometry locating the cylinder
     * @param {number} radius - the radius of the cylinder
     * @param {Material} material - the material of the ball
     */
    constructor(isom, radius, material) {
        const shape = new LocalVerticalCylinderShape(isom, radius);
        super(shape, material);
    }
}