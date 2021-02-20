import {Solid} from "../../../core/solids/Solid.js";
import {CylinderShape} from "../shapes/cylinder/CylinderShape.js";

/**
 * @class
 *
 * @classdesc
 * Hyperbolic cylinder
 */
export class Cylinder extends Solid {

    /**
     * Constructor
     * @param {Isometry} isom - the location of the cylinder
     * @param {number} radius - the radius of the cylinder
     * @param {Material} material - the material of the cylinder
     */
    constructor(isom, radius, material) {
        const shape = new CylinderShape(isom, radius);
        super(shape, material);
    }
}