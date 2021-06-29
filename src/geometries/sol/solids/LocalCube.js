import {Solid} from "../../../core/solids/Solid.js";
import {LocalCubeShape} from "../shapes/localCube/LocalCubeShape.js";

/**
 * @class
 *
 * @classdesc
 * Fake ball in Nil.
 */
export class LocalCube extends Solid {
    /**
     * Constructor.
     * @param {Isometry} location - the location of the cube
     * @param {Vector3} sides - the half width of the cube
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, sides, material, ptMaterial = undefined) {
        const shape = new LocalCubeShape(location, sides);
        super(shape, material, ptMaterial);
    }
}