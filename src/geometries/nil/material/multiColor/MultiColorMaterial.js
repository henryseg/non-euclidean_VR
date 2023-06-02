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
export class MultiColorMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {Color} mainColor - the color of the material
     * @param {Color} accent1 - amplitudes of the variations on each channel
     * @param {Color} accent2 - amplitudes of the variations on each channel
     * @param {Color} accent3 - amplitudes of the variations on each channel
     * @param {Bool} grid - do we draw a grid or not
     */
    constructor(mainColor, accent1,accent2,accent3,grid) {
        super();
        this.mainColor = mainColor;
        this.accent1 = accent1;
        this.accent2 = accent2;
        this.accent3 = accent3;
        this.grid = grid != undefined ? grid : false;
    }

    get uniformType() {
        return 'MultiColorMaterial';
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