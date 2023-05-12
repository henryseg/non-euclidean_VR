import {Color} from "three";

import {Material} from "../../../core/materials/Material.js";

import struct from "./shaders/struct.glsl";
import render from "../../../core/materials/shaders/renderUV.glsl.mustache";

/**
 * @class
 * @extends Material
 *
 * @classdesc
 * Alternating strips on a surface representing the hyperbolic plane.
 * Coordinates correspond to the Klein model
 * The strips are delimited by geodesic orthogonal to a fixed line
 */
export class HypStripsMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {Color} color1 - the color of the odd strips
     * @param {Color} color2 - the color of the even strips
     * @param {number} width1 - the width of the odd strips
     * @param {number} width2 - the width of the even strips
     */
    constructor(color1, color2, width1, width2) {
        super();
        this.color1 = color1;
        this.color2 = color2;
        this.width1 = width1;
        this.width2 = width2;
    }

    get uniformType() {
        return 'HypStripsMaterial';
    }

    get usesNormal() {
        return false;
    }

    get usesUVMap() {
        return true;
    }

    static glslClass() {
        return struct;
    }

    glslRender() {
        return render(this);
    }
}