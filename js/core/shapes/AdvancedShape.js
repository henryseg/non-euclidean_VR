import {Shape} from "./Shape.js";

/**
 * @class
 * @abstract
 *
 * @classdesc
 * A representation of 3D advanced shapes.
 * An advanced shape is a shape that is built on top of other shapes.
 * The types of the properties of an advanced shape may depend on the instance of this shape.
 * Theses properties will not be passed to the shader.
 * Only the signed distance function will carry the relevant data.
 */
export class AdvancedShape extends Shape {

    /**
     * Constructor.
     * The constructor takes no argument.
     */
    constructor() {
        super();
    }

    /**
     * Says whether the shape is a basic shape,
     * that it is not build on top of other shapes.
     * @type {boolean}
     */
    get isBasicShape() {
        throw false;
    }
}