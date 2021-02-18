import {Solid} from "../../../core/solids/Solid.js";
import {HalfSpaceShape} from "../shapes/halfSpace/HalfSpaceShape.js";

/**
 * @class
 *
 * @classdesc
 * Hyperbolic half space
 */
export class HalfSpace extends Solid {

    /**
     * Constructor
     * @param {Isometry} isom - the isometry defining location of the half space
     * @param {Material} material - the material of the ball
     */
    constructor(isom, material) {
        const shape = new HalfSpaceShape(isom);
        super(shape, material);
    }
}