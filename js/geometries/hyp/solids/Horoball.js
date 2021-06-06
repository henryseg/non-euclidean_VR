import {Solid} from "../../../core/solids/Solid.js";
import {HoroballShape} from "../shapes/horoball/HoroballShape.js";

/**
 * @class
 *
 * @classdesc
 * Hyperbolic horoball
 */
export class Horoball extends Solid {

    /**
     * Constructor
     * @param {Isometry|Vector3} location - the location of the horoball.
     * @param {number} offset - the offset of the horoball
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, offset, material, ptMaterial = undefined) {
        const shape = new HoroballShape(location, offset);
        super(shape, material, ptMaterial);
    }
}