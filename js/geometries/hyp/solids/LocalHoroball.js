import {Solid} from "../../../core/solids/Solid.js";
import {LocalHoroballShape} from "../shapes/localHoroball/LocalHoroballShape.js";

/**
 * @class
 *
 * @classdesc
 * Hyperbolic local horoball
 */
export class LocalHoroball extends Solid {

    /**
     * Constructor
     * @param {Vector} center - the center of the horoball
     * @param {number} offset - the offset of the horoball
     * @param {Material} material - the material of the ball
     */
    constructor(center, offset, material) {
        const shape = new LocalHoroballShape(center, offset);
        super(shape, material);
    }
}