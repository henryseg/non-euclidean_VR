import {Shape} from "./Shape.js";

/**
 * @class
 * @abstract
 *
 * @classdesc
 * A representation of 3D advanced shapes.
 * An advanced shape is a shape that is built on top of other shapes.
 * The type of the properties of an advanced shape may depend on the instance of this shape.
 * These properties will not be passed to the shader.
 * Only the signed distance function will carry the relevant data.
 */
export class AdvancedShape extends Shape {

    /**
     * Constructor.
     * @param {Isometry} isom - the position of the shape
     */
    constructor(isom = undefined) {
        super(isom);
    }

    /**
     * Says whether the shape is a basic shape,
     * that it is not build on top of other shapes.
     * @type {boolean}
     */
    get isBasicShape() {
        return false;
    }
}