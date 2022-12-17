import {Vector3} from "three";

import {Material} from "../../../core/materials/Material.js";

import struct from "./shaders/struct.glsl";
import render from "./shaders/render.glsl.mustache";
import renderNormal from "./shaders/renderNormal.glsl.mustache";
import renderUV from "./shaders/renderUV.glsl.mustache";
import renderNormalUV from "./shaders/renderNormalUV.glsl.mustache";


/**
 * @class
 *
 * @classdesc
 * Add a "Phong layer" to a given material.
 * The material passed in the constructor is used as the ambient color of the Phong shading model
 */
export class PhongWrapMaterial extends Material {

    /**
     * Constructor.
     * @param {Material} material - the material defining the base color
     * @param {Object} params - the parameters of the Phong layer:
     * - {number} ambient - the ambient reflection constant
     * - {number} diffuse - the diffuse reflection constant
     * - {number} specular - the specular reflection constant
     * - {number} shininess - the shininess reflection constant
     * - {Light[]} lights - light affecting the material
     */
    constructor(material, params = {}) {
        super();
        /**
         * material defining the base color
         * @type {Material}
         */
        this.material = material;
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
         * Is the material reflecting (false by default)
         * The changes will no be passed to the shader (hard coded shader)
         * @type {boolean}
         */
        this._isReflecting = params.isReflecting !== undefined ? params.isReflecting : false;
        /**
         * Reflectivity of the material
         * @type {Color}
         */
        this.reflectivity = params.reflectivity !== undefined ? params.reflectivity : new Vector3(0, 0, 0);
        /**
         * lights affecting the material
         * @type {Light[]}
         */
        this.lights = params.lights;
    }

    get uniformType() {
        return 'PhongWrapMaterial';
    }

    static glslClass() {
        return struct;
    }

    get usesNormal() {
        return true;
    }

    get usesUVMap() {
        return this.material.usesUVMap;
    }

    get usesLight() {
        return true;
    }

    get isReflecting() {
        return this._isReflecting;
    }

    glslRender() {
        if (this.material.usesNormal) {
            if (this.material.usesUVMap) {
                return renderNormalUV(this);
            } else {
                return renderNormal(this);
            }
        } else {
            if (this.material.usesUVMap) {
                return renderUV(this);
            } else {
                return render(this);
            }
        }
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
        for (const light of this.lights) {
            light.shader(shaderBuilder);
        }
        super.shader(shaderBuilder);
    }
}

/**
 * Wrap the material into another material handling the Phong model
 * @param {Material} material - the material defining the ambient color of the Phong model
 * @param {Object} params - the parameters of the Phong model
 * @return {PhongWrapMaterial} - the wrapped material.
 */
export function phongWrap(material, params = {}) {
    return new PhongWrapMaterial(material, params);
}