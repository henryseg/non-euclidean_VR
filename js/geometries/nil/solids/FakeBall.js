import {Solid} from "../../../core/solids/Solid.js";
import {FakeBallShape} from "../shapes/fakeBall/FakeBallShape.js";

/**
 * @class
 *
 * @classdesc
 * Fake ball in Nil.
 */
export class FakeBall extends Solid {
    /**
     * Constructor.
     * @param {Point} center - the center of the ball
     * @param {number} radius - the radius of the ball
     * @param {Material} material - the material of the ball
     */
    constructor(center, radius, material) {
        const shape = new FakeBallShape(center, radius);
        super(shape, material);
    }
}