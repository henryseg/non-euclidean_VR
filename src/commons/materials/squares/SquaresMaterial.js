import {Color, Vector4} from "three";

import {Material} from "../../../core/materials/Material.js";

import struct from "./shaders/struct.glsl";
import render from "../../../core/materials/shaders/renderUV.glsl.mustache";

/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material that display tilling of nested squares (or more generally parallelograms)
 * It works with at most four colors.
 * The given width correspond to the relative with of each squares.
 * The constructor will renormalize these numbers so that their sum is one.
 */
export class SquaresMaterial extends Material {

    /**
     * Constructor
     * @param {Vector2} dir1 - first direction of the lattice
     * @param {Vector2} dir2 - second direction of the lattice
     * @param {number[]} widths - a list of four numbers
     * @param {Color[]} colors - a list of four colors
     */
    constructor(dir1, dir2, colors, widths = undefined) {
        super();
        /**
         * first direction of the checkerboard
         * @type {Vector2}
         */
        this.dir1 = dir1;
        /**
         * second direction of the checkerboard
         * @type {Vector2}
         */
        this.dir2 = dir2;

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
        return 'SquaresMaterial';
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