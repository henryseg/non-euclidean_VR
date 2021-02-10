import {Solid} from "../../../core/solids/Solid.js";
import {LocalFakeBallShape} from "../shapes/localFakeBall/LocalFakeBallShape.js";

/**
 * @class
 *
 * @classdesc
 * Fake ball in Nil.
 */
export class LocalFakeBall extends Solid {
    /**
     * Constructor.
     * @param {Point} center - the center of the ball
     * @param {number} radius - the radius of the ball
     * @param {Material} material - the material of the ball
     */
    constructor(center, radius, material) {
        const shape = new LocalFakeBallShape(center, radius);
        super(shape, material);
    }
}