import {Solid} from "../../../core/solids/Solid.js";
import {WCappedCylinderShape} from "../shapes/wCappedCylinder/WCappedCylinderShape.js";

/**
 * @class
 *
 * @classdesc
 * Cylinder around the w-axis
 */
export class WCappedCylinder extends Solid {

    /**
     * Constructor
     * @param {Isometry} location - the location of the cylinder
     * @param {number} radius - the radius of the cylinder
     * @param {number} height - height of the cylinder
     * @param {number} smoothness - smoothness of the edge (polynomial smooth max)
     * @param {Material} material - the material of the cylinder
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, radius, height, smoothness, material, ptMaterial = undefined) {
        const shape = new WCappedCylinderShape(location, radius, height, smoothness);
        super(shape, material, ptMaterial);
    }
}