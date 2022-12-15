import {Solid} from "../../../core/solids/Solid.js";
import {CircleShape} from "../shapes/circle/CircleShape.js";

/**
 * @class
 * @extends Solid
 * @classdesc
 * Cylinder around the curve with equations z = cz and w = cw (or more precisely, its image by the isometry)
 */
export class Circle extends Solid {
    /**
     * Constructor
     * @param {Isometry} isom - the location of the cylinder
     * @param {number} cz - value of the z-coordinate
     * @param {number} cw - value of the w-coordinate
     * @param {number} radius - the radius of the cylinder around the curve
     * @param {Material} material - the material of the cylinder
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(isom, cz, cw, radius, material, ptMaterial = undefined) {
        const shape = new CircleShape(isom, cz, cw, radius);
        super(shape, material, ptMaterial);
    }
}