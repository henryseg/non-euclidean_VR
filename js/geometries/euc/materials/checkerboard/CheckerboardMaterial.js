import {mustache} from "../../../../lib/mustache.mjs";
import {Color} from "../../../../lib/three.module.js";

import {Material} from "../../../../core/materials/Material.js";

import render from "./shaders/render.js";
import struct from "./shaders/struct.js";


/**
 * @class
 *
 * @classdesc
 * A checker board material.
 * It can be combined with PhongWrapMaterial for lights effects
 */
export class CheckerboardMaterial extends Material {

    /**
     * Constructor
     * @param {Vector4} dir1 - first direction of the checkerboard
     * @param {Vector4} dir2 - second direction of the checkerboard
     * @param {Color} color1 - first color
     * @param {Color} color2 - second color-
     */
    constructor(dir1, dir2, color1, color2) {
        super();
        /**
         * first direction of the checkerboard
         * @type {Vector4}
         */
        this.dir1 = dir1;
        /**
         * second direction of the checkerboard
         * @type {Vector4}
         */
        this.dir2 = dir2;
        /**
         * first color
         * @type {Color}
         */
        this.color1 = color1;
        /**
         * second color
         * @type {Color}
         */
        this.color2 = color2;
    }

    get isCheckerboardMaterial() {
        return true;
    }

    get uniformType() {
        return 'CheckerboardMaterial';
    }

    static glslClass() {
        return struct;
    }

    glslRender() {
        return mustache.render(render, this);
    }
}