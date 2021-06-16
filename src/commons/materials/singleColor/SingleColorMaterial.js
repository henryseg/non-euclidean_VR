import {Color} from "three";
import mustache from "mustache/mustache.mjs";

import {Material} from "../../../core/materials/Material.js";

import struct from "./shaders/struct.js";
import render from "./shaders/render.js";

/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material that display a single plain color
 */
export class SingleColorMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {Color} color - the color of the material
     */
    constructor(color) {
        super();
        this.color = color;
    }

    get uniformType() {
        return 'SingleColorMaterial';
    }

    get usesNormal(){
        return false;
    }

    static glslClass() {
        return struct;
    }

    glslRender() {
        return mustache.render(render, this);
    }

}