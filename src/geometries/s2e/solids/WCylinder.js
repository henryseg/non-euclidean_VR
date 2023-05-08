import {Solid} from "../../../core/solids/Solid.js";
import {WCylinderShape} from "../shapes/wCylinder/WCylinderShape.js";

/**
 * @class
 *
 * @classdesc
 * Cylinder around the w-axis
 */
export class WCylinder extends Solid {

    /**
     * Constructor
     * @param {Isometry} location - the location of the cylinder
     * @param {number} radius - the radius of the cylinder
     * @param {Material} material - the material of the cylinder
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, radius, material, ptMaterial = undefined) {
        const shape = new WCylinderShape(location, radius);
        super(shape, material, ptMaterial);
    }
}