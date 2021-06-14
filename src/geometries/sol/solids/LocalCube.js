import {Solid} from "../../../core/solids/Solid.js";
import {localCubeShape} from "../shapes/localCube/localCubeShape.js";

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
     * @param {number} halfWidth - the half width of the cube
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, halfWidth, material, ptMaterial = undefined) {
        const shape = localCubeShape(location, halfWidth);
        super(shape, material, ptMaterial);
    }
}