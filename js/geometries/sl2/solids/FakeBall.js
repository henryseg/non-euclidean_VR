import {Solid} from "../../../core/solids/Solid.js";
import {FakeBallShape} from "../shapes/fakeBall/FakeBallShape.js";

/**
 * @class
 *
 * @classdesc
 * Fake ball in SL(2,R).
 */
export class FakeBall extends Solid {
    /**
     * Constructor.
     * @param {Isometry|Point} location - the location of the ball
     * @param {number} radius - the radius of the ball
     * @param {Material} material - the material of the ball
     */
    constructor(location, radius, material) {
        const shape = new FakeBallShape(location, radius);
        super(shape, material);
    }
}