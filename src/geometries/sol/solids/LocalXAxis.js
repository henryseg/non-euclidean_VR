import {Solid} from "../../../core/solids/Solid.js";
import {LocalXAxisShape} from "../shapes/localXAxis/LocalXAxisShape.js";

/**
 * @class
 *
 * @classdesc
 * Local x-axis in Sol
 */
export class LocalXAxis extends Solid {
    /**
     * Constructor.
     * @param {Isometry} location - the location of the x-axis
     * @param {number} radius - radius of the cylinder aroung the axis
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, radius, material, ptMaterial = undefined) {
        const shape = new LocalXAxisShape(location, radius);
        super(shape, material, ptMaterial);
    }
}