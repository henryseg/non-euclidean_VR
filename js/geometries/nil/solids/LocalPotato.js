import {Solid} from "../../../core/solids/Solid.js";
import {LocalPotatoShape} from "../shapes/localPotato/LocalPotatoShape.js";

/**
 * @class
 *
 * @classdesc
 * Local potato shape in Nil.
 */
export class LocalPotato extends Solid {
    /**
     * Constructor.
     * @param {Isometry|Point} location - the location of the potato
     * @param {number} radius - the radius of the ball
     * @param {number} coeff1 - the coefficient for the radial component
     * @param {number} coeff2 - the coefficient for the (fake) height component
     * @param {number} exp - the exponent
     * @param {Material} material - the material of the ball
     */
    constructor(location, radius, coeff1, coeff2, exp, material) {
        const shape = new LocalPotatoShape(location, radius, coeff1, coeff2, exp);
        super(shape, material);
    }
}