import {Solid} from "../../../core/solids/Solid.js";
import {BallShape} from "../shapes/ball/BallShape.js";

/**
 * @class
 *
 * @classdesc
 * Euclidean ball
 */
export class Ball extends Solid {

    /**
     * Constructor
     * @param {Isometry|Point} location - the location of the ball
     * @param {number} radius - the radius of the ball
     * @param {Material} material - the material of the ball
     */
    constructor(location, radius, material) {
        const shape = new BallShape(location, radius);
        super(shape, material);
    }
}