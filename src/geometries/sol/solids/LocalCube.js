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
     * @param {Isometry|Point} location - the location of the cube
     * @param {Vector3|number} sides - the half width of the cube
     * @param {number} smoothness - the length of the sides
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, sides, smoothness, material, ptMaterial = undefined) {
        const shape = new LocalCubeShape(location, sides, smoothness);
        super(shape, material, ptMaterial);
    }
}