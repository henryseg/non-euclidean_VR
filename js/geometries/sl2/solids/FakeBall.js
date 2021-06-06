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
     * @param {Isometry|Point|Vector} location - the location of the ball
     * @param {number} radius - the radius of the ball
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, radius, material, ptMaterial = undefined) {
        const shape = new FakeBallShape(location, radius);
        super(shape, material, ptMaterial);
    }
}