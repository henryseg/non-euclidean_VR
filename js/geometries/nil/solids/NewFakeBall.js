import {Solid} from "../../../core/solids/Solid.js";
import {NewFakeBallShape} from "../shapes/newFakeBall/NewFakeBallShape.js";

/**
 * @class
 *
 * @classdesc
 * Fake ball in Nil.
 */
export class NewFakeBall extends Solid {
    /**
     * Constructor.
     * @param {Isometry} isom - position of the ball
     * @param {number} radius - the radius of the ball
     * @param {Material} material - the material of the ball
     */
    constructor(isom, radius, material) {
        const shape = new NewFakeBallShape(isom, radius);
        super(shape, material);
    }
}