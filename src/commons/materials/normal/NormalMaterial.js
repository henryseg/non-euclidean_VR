import {Material} from "../../../core/materials/Material.js";

import struct from "./shaders/struct.glsl";
import render from "./shaders/render.glsl.mustache";

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
        return render(this);
    }

}