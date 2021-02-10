import {Solid} from "../../../core/solids/Solid.js";
import {LocalBallShape} from "../shapes/localBall/LocalBallShape.js";

/**
 * @class
 *
 * @classdesc
 * Hyperbolic ball
 */
export class LocalBall extends Solid {

    /**
     * Constructor
     * @param {Point|Vector} center - the center of the ball
     * @param {number} radius - the radius of the ball
     * @param {Material} material - the material of the ball
     */
    constructor(center, radius, material) {
        const shape = new LocalBallShape(center, radius);
        super(shape, material);
    }
}