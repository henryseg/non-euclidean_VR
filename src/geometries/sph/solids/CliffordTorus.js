import {Solid} from "../../../core/solids/Solid.js";
import {CliffordTorusShape} from "../shapes/cliffordTorus/CliffordTorusShape.js";

/**
 * @class
 *
 * @classdesc
 * Clifford Torus
 */
export class CliffordTorus extends Solid {

    /**
     * Constructor
     * @param {Isometry|Point|Vector} location - the location of the ball
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, material, ptMaterial = undefined) {
        const shape = new CliffordTorusShape(location);
        super(shape, material, ptMaterial);
    }
}