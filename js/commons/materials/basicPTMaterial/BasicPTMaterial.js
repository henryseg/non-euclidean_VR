import {mustache} from "../../../lib/mustache.mjs";
import {Color} from "../../../lib/threejs/build/three.module.js";

import {PTMaterial} from "../../../core/materials/PTMaterial.js";

import struct from "./shaders/struct.js";
import render from "./shaders/render.js";
import fresnel from "../../imports/fresnelReflectAmount.js";

export class BasicPTMaterial extends PTMaterial {

    /**
     * Constructor
     * @param {Object} params - all the parameters of the material.
     */
    constructor(params) {
        super();
        /**
         * Emission Color
         * @type {Color}
         */
        this.emission = params.emission !== undefined ? params.emission : new Color(0, 0, 0);
        /**
         * Diffuse color (basically the base color of the material)
         * @type {Color}
         */
        this.diffuse = params.diffuse !== undefined ? params.diffuse : new Color(1, 1, 1);
        /**
         * Specular color
         * @type {Color}
         */
        this.specular = params.specular !== undefined ? params.specular : new Color(1, 1, 1);
        /**
         * Absorb color (if the material is transparent)
         * @type {Color}
         */
        this.absorb = params.absorb !== undefined ? params.absorb : new Color(0.1, 0.1, 0.1);
        /**
         * Index of refraction
         * @type {number}
         */
        this.ior = params.ior !== undefined ? params.ior : 1;
        /**
         * Roughness of the material
         * @type {number}
         */
        this.roughness = params.roughness !== undefined ? params.roughness : 0.2;
        /**
         * Reflection chance
         * Chance of reflection.
         * Between 0 and 1
         * @type {number}
         */
        this.reflectionChance = params.reflectionChance !== undefined ? params.reflectionChance : 0.1;
        /**
         * Refraction chance
         * Chance of refraction.
         * Between 0 and 1
         * @type {number}
         */
        this.refractionChance = params.refractionChance !== undefined ? params.refractionChance : 0;
        /**
         * Diffuse chance
         * Chance of diffuse.
         * Between 0 and 1
         * @type {number}
         */
        this.diffuseChance = params.diffuseChance !== undefined ? params.diffuseChance : 0.9;
        // the three chances should add up to one
        const total = this.reflectionChance + this.refractionChance + this.diffuseChance;
        this.reflectionChance = this.reflectionChance / total;
        this.refractionChance = this.refractionChance / total;
        this.diffuseChance = this.diffuseChance / total;

        // computation for Fresnel reflection amount
        this.addImport(fresnel);
    }

    get uniformType() {
        return 'BasicPTMaterial';
    }

    static glslClass() {
        return struct;
    }

    glslRender() {
        return mustache.render(render, this);
    }
}