import {mustache} from "../../../lib/mustache.mjs";
import {AdvancedShape} from "../../../core/shapes/AdvancedShape.js";

import sdf from "./shaders/sdf.js";
import gradient from "./shaders/gradient.js";
import uv from "./shaders/uv.js";

/**
 * @class
 *
 * @classdesc
 * Wrap a complicated shape inside a simpler one.
 */
export class WrapShape extends AdvancedShape {

    /**
     * Constructor.
     * @param {Shape} wrap - the wrapping shape
     * @param {Shape} shape - the wrapped shape
     */
    constructor(wrap, shape) {
        if (wrap.isGlobal !== shape.isGlobal) {
            throw new Error('WrapShape: the two shapes should be both local or both global');
        }
        super();
        this.wrap = wrap;
        this.shape = shape;
    }

    get isWrapShape() {
        return true;
    }

    get isGlobal() {
        return this.shape.isGlobal;
    }

    get hasUVMap() {
        return this.shape.hasUVMap;
    }

    /**
     * Setter for isometry.
     * Propagate the setup
     * @param value
     */
    set isom(value){
        this.wrap.isom = value;
        this.shape.isom = value;
    }

    static glslClass() {
        return '';
    }

    glslSDF() {
        return mustache.render(sdf, this);
    }

    glslGradient() {
        return mustache.render(gradient, this);
    }

    glslUVMap() {
        return mustache.render(uv, this);
    }

    /**
     * Set the ID of the shape.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    setId(scene) {
        this.wrap.setId(scene);
        this.shape.setId(scene);
        super.setId(scene);
    }

    /**
     * Additional actions to perform when the object is added to the scene.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    onAdd(scene) {
        this.wrap.onAdd(scene);
        this.shape.onAdd(scene);
        super.onAdd(scene);
    }

    shader(shaderBuilder) {
        this.wrap.shader(shaderBuilder);
        this.shape.shader(shaderBuilder);
        super.shader(shaderBuilder);
    }
}

/**
 * Wrap the given shape
 * The goal is a to have behavior similar to `union` and `intersection`.
 * @param {Shape} wrap - the wrap
 * @param {Shape} shape - the shape to wrap
 * @return {WrapShape} the wrapped shape
 */
export function wrap(wrap, shape) {
    return new WrapShape(wrap, shape);
}
