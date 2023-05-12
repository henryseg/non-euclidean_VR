import {Color} from "three";

import {Material} from "../../../../core/materials/Material.js";

import struct from "./shaders/struct.glsl";
import render from "../../../../core/materials/shaders/render.glsl.mustache";

/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material that display a single plain color
 */
export class NoiseColorMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {Color} mainColor - the color of the material
     * @param {Color} weight - amplitudes of the variations on each channel
     * @param {number} intensity - amplitude of the variation
     */
    constructor(mainColor, weight, intensity) {
        super();
        this.mainColor = mainColor;
        this.weight = weight;
        this.intensity = intensity;
    }

    get uniformType() {
        return 'NoiseColorMaterial';
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