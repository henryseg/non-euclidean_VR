import {Solid} from "../../../core/solids/Solid.js";
import {CylinderShape} from "../shapes/cylinder/CylinderShape.js";

/**
 * @class
 * @extends Solid
 * @classdesc
 * Cylinder in spherical geometry
 */
export class Cylinder extends Solid {
    /**
     * Constructor
     * @param {Isometry} location - the location of the cylinder
     * @param {number} radius - the radius of the cylinder
     * @param {Material} material - the material of the cylinder
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, radius, material, ptMaterial = undefined) {
        const shape = new CylinderShape(location, radius);
        super(shape, material, ptMaterial);
    }
}