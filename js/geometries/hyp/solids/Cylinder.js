import {Solid} from "../../../core/solids/Solid.js";
import {CylinderShape} from "../shapes/cylinder/CylinderShape.js";

/**
 * @class
 *
 * @classdesc
 * Hyperbolic ball
 */
export class Cylinder extends Solid {

    /**
     * Constructor
     * @param {Isometry} isom - the center of the ball
     * @param {number} radius - the radius of the ball
     * @param {Material} material - the material of the ball
     */
    constructor(radius, isom, material) {
        const shape = new CylinderShape(radius, isom);
        super(shape, material);
    }
}