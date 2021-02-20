import {Solid} from "../../../core/solids/Solid.js";
import {LocalBallShape} from "../shapes/localBall/LocalBallShape.js";

/**
 * @class
 *
 * @classdesc
 * Euclidean local ball
 */
export class LocalBall extends Solid {

    /**
     * Constructor
     * @param {Isometry|Point} location - Either an isometry, or a point representing the center of the ball
     * @param {number} radius - the radius of the ball
     * @param {Material} material - the material of the ball
     */
    constructor(location, radius, material) {
        const shape = new LocalBallShape(location, radius);
        super(shape, material);
    }
}