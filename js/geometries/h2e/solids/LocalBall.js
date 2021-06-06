import {Solid} from "../../../core/solids/Solid.js";
import {LocalBallShape} from "../shapes/localBall/LocalBallShape.js";

/**
 * @class
 *
 * @classdesc
 * Ball in H2 x E.
 */
export class LocalBall extends Solid {

    /**
     * Constructor
     * @param {Isometry|Point|Vector} location - the location of the ball
     * @param {number} radius - the radius of the ball
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, radius, material, ptMaterial = undefined) {
        const shape = new LocalBallShape(location, radius);
        super(shape, material, ptMaterial);
    }
}