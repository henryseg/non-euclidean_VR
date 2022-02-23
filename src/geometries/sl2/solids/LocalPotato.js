import {Solid} from "../../../core/solids/Solid.js";
import {LocalPotatoShape} from "../shapes/localPotato/localPotatoShape.js";

/**
 * @class
 *
 * @classdesc
 * Fake ball in SL(2,R).
 */
export class LocalPotato extends Solid {
    /**
     * Constructor.
     * @param {Isometry|Point|Vector} location - the location of the ball
     * @param {number} radius - the radius of the ball
     * @param {number} wRescale - rescaling coeff on the fiber coordinate
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, radius, wRescale, material, ptMaterial = undefined) {
        const shape = new LocalPotatoShape(location, radius, wRescale);
        super(shape, material, ptMaterial);
    }
}