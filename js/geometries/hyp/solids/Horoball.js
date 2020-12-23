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
     * @param {Vector} center - the center of the horoball
     * @param {number} offset - the offset of the horoball
     * @param {Material} material - the material of the ball
     */
    constructor(center, offset, material) {
        const shape = new HoroballShape(center, offset);
        super(shape, material);
    }
}