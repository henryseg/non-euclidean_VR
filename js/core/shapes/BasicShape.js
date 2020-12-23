import {Shape} from "./Shape.js";

/**
 * @class
 * @abstract
 *
 * @classdesc
 * A representation of 3D basic shape.
 * A basic shape is a shape that is not built on top of other shapes.
 * The types of the properties of a basic shape should not depend on the instance of this shape.
 * Indeed these properties will be passed to the shader in the form of a struct.
 * (This gives the options to animate the shapes.)
 */
export class BasicShape extends Shape {

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
        return true;
    }
}