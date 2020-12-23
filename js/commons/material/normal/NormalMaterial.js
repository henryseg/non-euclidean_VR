import {mustache} from "../../../lib/mustache.mjs";
import {Material} from "../../../core/materials/Material.js";

import struct from "./shaders/struct.js";
import render from "./shaders/render.js";

/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material that maps the normal vectors to RGB colors.
 */
export class NormalMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     */
    constructor() {
        super();
    }

    get uniformType() {
        return '';
    }

    static glslClass() {
        return struct;
    }

    glslRender() {
        return mustache.render(render, this);
    }

}