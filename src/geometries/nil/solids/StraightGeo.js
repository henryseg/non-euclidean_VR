import {Solid} from "../../../core/solids/Solid.js";

import {StraightGeoShape} from "../shapes/straightGeo/StraightGeoShape.js";

/**
 * @class
 *
 * @classdesc
 * Straight geodesic in Nil
 */
export class StraightGeo extends Solid {
    /**
     * Constructor.
     * @param {Isometry} isom - the isometry locating the cylinder
     * @param {number} radius - the radius of the cylinder
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(isom, radius, material, ptMaterial = undefined) {
        const shape = new StraightGeoShape(isom, radius);
        super(shape, material, ptMaterial);
    }
}