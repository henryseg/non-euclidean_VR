import {mustache} from "../../../lib/mustache.mjs";
import {AdvancedShape} from "../../../core/shapes/AdvancedShape.js";

import sdf from "./shaders/sdf.js";
import gradient from "./shaders/gradient.js";

/**
 * @class
 *
 * @classdesc
 * Union of two shapes
 */
export class UnionShape extends AdvancedShape {

    /**
     * Constructor.
     * The two shapes should be both local or both global.
     * @param {Shape} shape1 - the first shape
     * @param {Shape} shape2 - the second shape
     */
    constructor(shape1, shape2) {
        if (shape1.isGlobal !== shape2.isGlobal) {
            throw new Error('UnionShape: the two shapes should be both local or both global');
        }
        super();
        this.shape1 = shape1;
        this.shape2 = shape2;
    }

    get isGlobal() {
        return this.shape1.isGlobal;
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

    shader(shaderBuilder) {
        this.shape1.shader(shaderBuilder);
        this.shape2.shader(shaderBuilder);
        super.shader(shaderBuilder);
    }
}

/**
 * The union of an arbitrary number of shapes
 */
export function union() {
    let res;
    const n = arguments.length;
    if (n === 0) {
        throw new Error('union: the function expect at least one argument');
    }
    res = arguments[0];
    for (let i = 1; i < n; i++) {
        res = new UnionShape(res, arguments[i]);
    }
    return res;
}