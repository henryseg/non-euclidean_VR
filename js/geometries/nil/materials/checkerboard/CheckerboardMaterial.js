import {mustache} from "../../../../lib/mustache.mjs";
import {Color} from "../../../../lib/three.module.js";

import {Material} from "../../../../core/materials/Material.js";

import render from "./shaders/render.js";
import struct from "./shaders/struct.js";


export class CheckerboardMaterial extends Material {

    /**
     * Constructor
     * @param {Vector4} dir1 - first direction of the checkerboard
     * @param {Vector4} dir2 - second direction of the checkerboard
     * @param {Color} color1 - first color
     * @param {Color} color2 - second color
     * @param {Object} params - the parameters of the material:
     * - {number} ambient - the ambient reflection constant
     * - {number} diffuse - the diffuse reflection constant
     * - {number} specular - the specular reflection constant
     * - {number} shininess - the shininess reflection constant
     * - {Light[]} lights - the lights affecting the material
     */
    constructor(dir1, dir2, color1, color2, params) {
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

        /**
         * ambient reflection constant
         * @type {number}
         */
        this.ambient = params.ambient !== undefined ? params.ambient : 0.5;
        /**
         * diffuse reflection constant
         * @type {number}
         */
        this.diffuse = params.diffuse !== undefined ? params.diffuse : 0.5;
        /**
         * specular reflection constant
         * @type {number}
         */
        this.specular = params.specular !== undefined ? params.specular : 0.5;
        /**
         * shininess reflection constant
         * @type {number}
         */
        this.shininess = params.shininess !== undefined ? params.shininess : 10;
        /**
         * lights affecting the material
         * @type {Light[]}
         */
        this.lights = params.lights;
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

    shader(shaderBuilder) {
        for (const light of this.lights) {
            light.shader(shaderBuilder);
        }
        super.shader(shaderBuilder);
    }
}