import {mustache} from "../../lib/mustache.mjs";
import {Generic} from "../Generic.js";

import gradient from "./shaders/gradient.js";

/**
 * @class
 * @abstract
 *
 * @classdesc
 * A representation of a 3D geometric shape.
 * It should not be confused with Three.js `Shape` class.
 * It is more an analogue of the class `BufferGeometry` in Three.js.
 */
export class Shape extends Generic {

    /**
     * Constructor.
     * The constructor takes no argument.
     */
    constructor() {
        super();
    }

    /**
     * Says that the object inherits from `Shape`
     * @type {boolean}
     */
    get isShape() {
        return true;
    }

    /**
     * Says whether the shape is a basic shape,
     * that it is not build on top of other shapes.
     * @type {boolean}
     */
    get isBasicShape() {
        throw new Error('Shape: this method should be implemented');
    }

    /**
     * Says whether the shape is a basic shape,
     * that it is not build on top of other shapes.
     * @type {boolean}
     */
    get isAdvancedShape() {
        return !this.isBasicShape;
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        throw new Error('Shape: this method should be implemented');
    }

    /**
     * Says whether the shape is local. True if local, false otherwise.
     * @type {boolean}
     */
    get isLocal() {
        return !this.isGlobal;
    }

    /**
     * Says whether the shape comes with a UV map.
     * Default is false
     * If true, the shape should implement the method glslUVMap.
     * @type {boolean}
     */
    get hasUVMap() {
        return false;
    }

    /**
     * Return the chunk of GLSL code corresponding to the signed distance function.
     * The SDF on the GLSL side should have the following signature
     * `float {{name}}_sdf(RelVector v)`
     * It takes a vector, corresponding the position and direction of the geodesic we are following
     * and return an under-estimation of the distance from this position to the shape along this geodesic.
     * @abstract
     * @return {string}
     */
    glslSDF() {
        throw new Error('Shape: this method should be implemented');
    }

    /**
     * Return the chunk of GLSL code corresponding to the gradient field.
     * The default computation approximates numerically the gradient.
     * This function can be overwritten for an explicit computation.
     * If so, the gradient function on the GLSL side should have the following signature
     * `RelVector {{name}}_gradient(RelVector v)`
     * It takes the vector obtained when we hit the shape and render the normal to the shape at this point.
     * @return {string}
     */
    glslGradient() {
        return mustache.render(gradient, this);
    }

    /**
     * Return the chunk of GLSL code corresponding to the UV map
     * The UV map on the GLSL side should have the signature
     * `vec2 {{name}}_uvMap(RelVector v)`
     * It takes the vector obtained when we hit the shape and render the UV coordinates at this point.
     */
    glslUVMap() {
        throw new Error('Shape: this method should be implemented');
    }

    /**
     * Compile all the function directly related to the object (e.g. sdf, gradient, etc).
     * @return {string}
     */
    glslInstance() {
        let res = this.glslSDF() + "\r\n" + this.glslGradient();
        if (this.hasUVMap) {
            res = res + "\r\n" + this.glslUVMap();
        }
        return res;
    }
}

