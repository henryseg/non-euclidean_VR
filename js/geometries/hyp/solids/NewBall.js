import {Solid} from "../../../core/solids/Solid.js";
import {NewBallShape} from "../shapes/newBall/NewBallShape.js";

/**
 * @class
 *
 * @classdesc
 * Hyperbolic ball
 */
export class NewBall extends Solid {

    /**
     * Constructor
     * @param {Isometry} isom - the isometry defining the center of the ball
     * @param {number} radius - the radius of the ball
     * @param {Material} material - the material of the ball
     */
    constructor(isom, radius, material) {
        const shape = new NewBallShape(isom, radius);
        super(shape, material);
    }
}