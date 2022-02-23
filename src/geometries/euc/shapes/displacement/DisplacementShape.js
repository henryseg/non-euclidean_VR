import {AdvancedShape} from "../../../../core/shapes/AdvancedShape.js";

import sdf from "./shaders/sdf.glsl.mustache";
import gradient from "./shaders/gradient.glsl.mustache";

/**
 * @class
 *
 * @classdesc
 * A displacement modifier on a shape
 * After Inigo Quilez
 * https://iquilezles.org/www/articles/distfunctions/distfunctions.htm
 */
export class DisplacementShape extends AdvancedShape {

    /**
     * Constructor
     * @param {Isometry} isom - the position of the shape
     * @param {Shape} shape - the base shape
     */
    constructor(isom, shape) {
        super(isom);
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
        return false;
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