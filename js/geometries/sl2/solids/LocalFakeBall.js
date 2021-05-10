import {Solid} from "../../../core/solids/Solid.js";
import {LocalFakeBallShape} from "../shapes/localfakeBall/LocalFakeBallShape.js";

/**
 * @class
 *
 * @classdesc
 * Fake ball in SL(2,R).
 */
export class LocalFakeBall extends Solid {
    /**
     * Constructor.
     * @param {Isometry|Point|Vector} location - the location of the ball
     * @param {number} radius - the radius of the ball
     * @param {Material} material - the material of the ball
     */
    constructor(location, radius, material) {
        const shape = new LocalFakeBallShape(location, radius);
        super(shape, material);
    }
}