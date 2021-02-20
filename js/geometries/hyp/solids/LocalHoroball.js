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
     * @param {Isometry|Vector3} location - the location of the horoball
     * @param {number} offset - the offset of the horoball
     * @param {Material} material - the material of the ball
     */
    constructor(location, offset, material) {
        const shape = new LocalHoroballShape(location, offset);
        super(shape, material);
    }
}