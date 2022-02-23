import {Color} from "three";

import {PTMaterial} from "../../../core/materials/PTMaterial.js";

import struct from "./shaders/struct.glsl";
import rayType from "./shaders/rayType.glsl.mustache";
import render from "./shaders/render.glsl.mustache";
import renderNormalUV from "./shaders/renderNormalUV.glsl.mustache";
import renderNormal from "./shaders/renderNormal.glsl.mustache";
import renderUV from "./shaders/renderUV.glsl.mustache";
import fresnel from "../../imports/fresnelReflectAmount.glsl";
import {PhongWrapMaterial} from "../phongWrap/PhongWrapMaterial.js";

export class PathTracerWrapMaterial extends PTMaterial {

    /**
     * Constructor
     * @param {Material} material - the material giving the diffuse color.
     * @param {Object} params - all the parameters of the material.
     */
    constructor(material, params) {
        super();
        /**
         * Base material
         * This material should not uses light or be reflecting.
         * Otherwise it will conflict with the path tracer
         * @param {Material} material - the material giving the diffuse color
         */
        this.material = material;
        /**
         * Surface Emission Color
         * @type {Color}
         */
        this.emission = params.emission !== undefined ? params.emission : new Color(0, 0, 0);
        /**
         * Volumetric Emission Color
         * @type {Color}
         */
        this.volumeEmission = params.volumeEmission !== undefined ? params.volumeEmission : new Color(0, 0, 0);
        /**
         * Optical Depth (Probability of scattering inside a material)
         * @type {number}
         */
        this.opticalDepth = params.opticalDepth !== undefined ? params.opticalDepth : 0;
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
        return 'PathTracerWrapMaterial';
    }

    static glslClass() {
        return struct;
    }

    get usesUVMap() {
        return this.material.usesUVMap;
    }

    glslRender() {
        let res = "";
        res = res + rayType(this);

        if (this.material.usesNormal) {
            if (this.material.usesUVMap) {
                res = res + renderNormalUV(this);
            } else {
                res = res + renderNormal(this);
            }
        } else {
            if (this.material.usesUVMap) {
                res = res + renderUV(this);
            } else {
                res = res + render(this);
            }
        }
        return res;
    }

    /**
     * Set the ID of the shape.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    setId(scene) {
        this.material.setId(scene);
        super.setId(scene);
    }

    /**
     * Additional actions to perform when the object is added to the scene.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    onAdd(scene) {
        this.material.onAdd(scene);
        super.onAdd(scene);
    }

    shader(shaderBuilder) {
        this.material.shader(shaderBuilder);
        super.shader(shaderBuilder);
    }
}


/**
 * Wrap the material into another material handling the Phong model
 * @param {Material} material - the material defining the ambient color of the Phong model
 * @param {Object} params - the parameters of the Phong model
 * @return {PathTracerWrapMaterial} - the wrapped material.
 */
export function pathTracerWrap(material, params = {}) {
    return new PathTracerWrapMaterial(material, params);
}