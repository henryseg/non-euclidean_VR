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
export class VaryingColorMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {Color} mainColor - the color of the material
     * @param {Color} weight - amplitudes of the variations on each channel
     */
    constructor(mainColor, weight) {
        super();
        this.mainColor = mainColor;
        this.weight = weight;
    }

    get uniformType() {
        return 'VaryingColorMaterial';
    }

    get usesNormal(){
        return false;
    }

    static glslClass() {
        return struct;
    }

    glslRender() {
        return render(this);
    }

}