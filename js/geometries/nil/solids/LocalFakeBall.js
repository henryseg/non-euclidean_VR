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
     * @param {Isometry|Point} location - the location of the ball
     * @param {number} radius - the radius of the ball
     * @param {Material} material - the material of the ball
     */
    constructor(location, radius, material) {
        const shape = new LocalFakeBallShape(location, radius);
        super(shape, material);
    }
}