import {AdvancedShape} from "../../../core/shapes/AdvancedShape.js";

import sdf from "./shaders/sdf.glsl.mustache";
import gradient from "./shaders/gradient.glsl.mustache";
import uv from "./shaders/uv.glsl.mustache";

/**
 * @class
 *
 * @classdesc
 * Union of two shapes
 */
export class ComplementShape extends AdvancedShape {

    /**
     * Constructor.
     * @param {Shape} shape
     */
    constructor(shape) {
        super();
        this.shape = shape;
        this.shape.parent = this;
    }

    updateAbsoluteIsom() {
        super.updateAbsoluteIsom();
        this.shape.updateAbsoluteIsom();
    }

    updateData() {
        super.updateData();
        this.shape.updateData();
    }

    get isGlobal() {
        return this.shape.isGlobal;
    }

    get hasUVMap() {
        return this.shape.hasUVMap;
    }

    static glslClass() {
        return '';
    }

    glslSDF() {
        return sdf(this);
    }

    glslGradient() {
        return gradient(this);
    }

    glslUVMap() {
        return uv(this);
    }

    /**
     * Set the ID of the shape.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    setId(scene) {
        this.shape.setId(scene);
        super.setId(scene);
    }

    /**
     * Additional actions to perform when the object is added to the scene.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    onAdd(scene) {
        this.shape.onAdd(scene);
        super.onAdd(scene);
    }

    shader(shaderBuilder) {
        this.shape.shader(shaderBuilder);
        super.shader(shaderBuilder);
    }
}

/**
 * Return the complement of the given shape.
 * The goal is a to have behavior similar to `union` and `intersection`.
 * @param {Shape} shape - the shape to invert
 * @return {ComplementShape} the complement of the given shape.
 */
export function complement(shape) {
    return new ComplementShape(shape);
}