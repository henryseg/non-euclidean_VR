import {Color, Vector4} from "three";

import {Material} from "../../../../core/materials/Material.js";

import struct from "./shaders/struct.glsl";
import render from "../../../../core/materials/shaders/renderUV.glsl.mustache";

/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material that display an n-ary tilling on a hyperbolic sheet
 * It works with at most four colors.
 * The given width correspond to the relative with of each square.
 * The constructor will normalize these numbers so that their sum is one.
 */
export class NaryMaterial extends Material {

    /**
     * Constructor
     * @param {number} t - horizontal translation (action of a parabolic element on the tilling)
     * @param {number} n - scaling (both action of a loxodromic element on the tilling and the multiplicity)
     * @param {number[]} widths - a list of four numbers
     * @param {Color[]} colors - a list of four colors
     */
    constructor(t, n, colors, widths = undefined) {
        super();
        /**
         * first direction of the checkerboard
         * @type {number}
         */
        this.t = t;
        /**
         * second direction of the checkerboard
         * @type {number}
         */
        this.n = n;

        const aux0 = widths !== undefined ? widths : [0.5, 1, 1, 0.5];
        let sum = 0;
        const aux1 = [];
        for (let i = 0; i < 4; i++) {
            if (aux0[i] !== undefined) {
                sum = sum + aux0[i];
            }
            aux1[i] = sum;
        }
        for (let i = 0; i < 4; i++) {
            aux1[i] = aux1[i] / sum;
        }
        this.lengths = new Vector4(...aux1);


        let lastColor = new Color(1, 1, 1);
        /**
         * first color
         * @type {Color}
         */
        this.color0 = colors[0] !== undefined ? colors[0] : lastColor.clone();
        lastColor = this.color0;
        /**
         * second color
         * @type {Color}
         */
        this.color1 = colors[1] !== undefined ? colors[1] : lastColor.clone();
        lastColor = this.color1;
        /**
         * third color
         * @type {Color}
         */
        this.color2 = colors[2] !== undefined ? colors[2] : lastColor.clone();
        lastColor = this.color2;
        /**
         * fourth color
         * @type {Color}
         */
        this.color3 = colors[3] !== undefined ? colors[3] : lastColor.clone();
    }

    get uniformType() {
        return 'NaryMaterial';
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