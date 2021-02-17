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
     * @param {number} radius - the radius of the cylinder
     * @param {Isometry} isom - the isometry locating the cylinder
     * @param {Material} material - the material of the ball
     */
    constructor(radius, isom, material) {
        const shape = new LocalVerticalCylinderShape(radius, isom);
        super(shape, material);
    }
}