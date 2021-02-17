import {Solid} from "../../../core/solids/Solid.js";
import {VerticalHalfSpaceShape} from "../shapes/verticalHalfSpace/VerticalHalfSpaceShape.js";

/**
 * @class
 *
 * @classdesc
 * Vertical half space in Nil
 */
export class VerticalHalfSpace extends Solid {
    /**
     * Constructor.
     * @param {Point} pos - a point on the boundary of the half space
     * @param {Vector4|Vector3|Vector2} normal - the normal to the boundary of the half space (pointing outwards).
     * @param {Material} material - the material of the ball
     */
    constructor(pos,normal, material) {
        const shape = new VerticalHalfSpaceShape(pos, normal);
        super(shape, material);
    }
}