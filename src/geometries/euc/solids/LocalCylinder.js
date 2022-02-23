import {Solid} from "../../../core/solids/Solid.js";
import {LocalCylinderShape} from "../shapes/localCylinder/LocalCylinderShape.js";

/**
 * @class
 *
 * @classdesc
 * Euclidean cylinder
 */
export class LocalCylinder extends Solid {

    /**
     * Constructor
     * @param {Isometry} isom - the location of the cylinder
     * @param {number} radius - the radius of the ball
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(isom, radius, material, ptMaterial = undefined) {
        const shape = new LocalCylinderShape(isom, radius);
        super(shape, material, ptMaterial);
    }
}