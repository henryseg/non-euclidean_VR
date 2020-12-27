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
     * @param {Vector3} normal - the normal to the half space (the last coordinates should be zero)
     * @param {Vector3} uDir - the direction of the u coordinates
     * @param {Vector3} vDir - the direction of the v coordinates
     * @param {Material} material - the material of the half space
     */
    constructor(pos, normal, material, uDir = undefined, vDir = undefined) {
        const shape = new HalfSpaceShape(pos, normal, uDir, vDir);
        super(shape, material);
    }
}