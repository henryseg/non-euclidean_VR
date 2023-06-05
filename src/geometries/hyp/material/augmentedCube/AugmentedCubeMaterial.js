import {Color} from "three";

import {Material} from "../../../../core/materials/Material.js";

import struct from "./shaders/struct.glsl";
import render from "../../../../core/materials/shaders/render.glsl.mustache";

/**
 * @class
 * @extends Material
 *
 * @classdesc
 * Warning: this material only works with the set of teleportations `quotientGenus2`
 * (indeed it uses the finite part of the group element to decide the color) of the cell
 */
export class AugmentedCubeMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {Color[]} mainColors - an array of 6 colors
     * @param {Color} weight - amplitudes of the variations on each channel
     */
    constructor(mainColors,weight) {
        super();
        this.mainColors = mainColors;
        this.weight = weight;
    }

    get mainColor0() {
        return this.mainColors[0];
    }

    get mainColor1() {
        return this.mainColors[1];
    }

    get mainColor2() {
        return this.mainColors[2];
    }

    get mainColor3() {
        return this.mainColors[3];
    }

    get mainColor4() {
        return this.mainColors[4];
    }

    get mainColor5() {
        return this.mainColors[5];
    }

    get uniformType() {
        return 'AugmentedCubeMaterial';
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