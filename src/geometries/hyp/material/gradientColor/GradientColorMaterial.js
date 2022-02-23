import {Color} from "three";

import {Material} from "../../../../core/materials/Material.js";

import struct from "./shaders/struct.glsl";
import render from "../../../../core/materials/shaders/render.glsl.mustache";

/**
 * @class
 * @extends Material
 *
 * @classdesc
 * Gradient along the z-direction
 */
export class GradientColorMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {Color} color1 - first color
     * @param {Color} color2 - second color
     * @param {number} start1 - z-coordinate for color 1
     * @param {number} start2 - z-coordinate for color 2
     */
    constructor(color1, color2, start1, start2) {
        super();
        this.color1 = color1;
        this.color2 = color2;
        this.start1 = start1;
        this.start2 = start2;
    }

    get uniformType() {
        return 'GradientColorMaterial';
    }

    get usesNormal() {
        return false;
    }

    static glslClass() {
        return struct;
    }

    glslRender() {
        return render(this);
    }

}