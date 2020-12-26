import {Solid} from "../../../core/solids/Solid.js";
import {HalfSpaceShape} from "../shapes/halfSpace/HalfSpaceShape.js";

/**
 * @class
 *
 * @classdesc
 * Euclidean Half space
 */
export class HalfSpace extends Solid {

    /**
     * Constructor
     * @param {Point} pos - a point on the boundary of the half space
     * @param {Vector4|Vector3} normal - the normal to the half space
     * @param {Material} material - the material of the half space
     */
    constructor(pos, normal, material) {
        const shape = new HalfSpaceShape(pos, normal);
        super(shape, material);
    }
}