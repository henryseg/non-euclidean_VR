import {Color} from 'three';
import mustache from "mustache/mustache.mjs";

import {Material} from "../../../core/materials/Material.js";

import struct from "./shaders/struct.js";
import render from "./shaders/render.js";


/**
 * @class
 *
 * @classdesc
 * Debug material
 */
export class DebugMaterial extends Material {
    /**
     * Constructor. Build a new material from the given data
     */
    constructor() {
        super();
    }

    get uniformType() {
        return '';
    }

    /**
     * Says whether the material requires the normal to the shape for its computation.
     * Default is true.
     * @return {boolean}
     */
    get usesNormal() {
        return false;
    }

    /**
     * Says whether the material requires a UV map on the shape for its computation.
     * Default is false.
     * @return {boolean}
     */
    get usesUVMap() {
        return false;
    }

    get usesLight() {
        return false;
    }

    get isReflecting() {
        return false;
    }

    static glslClass() {
        return struct;
    }

    glslRender() {
        return mustache.render(render, this);
    }

    shader(shaderBuilder) {
        super.shader(shaderBuilder);
    }
}