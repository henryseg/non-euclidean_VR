import {mustache} from "../../../lib/mustache.mjs";
import {
    LinearFilter, LinearMipmapNearestFilter,
    NearestFilter, NearestMipmapLinearFilter,
    RepeatWrapping,
    TextureLoader,
    Vector2
} from "../../../lib/threejs/build/three.module.js";

import {Material} from "../../../core/materials/Material.js";

import struct from "./shaders/struct.js";
import render from "./shaders/render.js";

/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material given by a image file
 */
export class SimpleTextureMaterial extends Material {

    /**
     * Constructor
     * @param {string} file - path to the image file
     * @param {Object} params - options for the material
     */
    constructor(file, params = {}) {
        super();
        /**
         * Texture built from the given image
         * @type {Texture}
         */
        this.sampler = new TextureLoader().load(file);
        this.sampler.wrapS = params.wrapS !== undefined ? params.wrapS : RepeatWrapping;
        this.sampler.wrapT = params.wrapT !== undefined ? params.wrapT : RepeatWrapping;
        this.sampler.magFilter = LinearFilter;
        this.sampler.minFilter = LinearFilter;

        /**
         * Point in the UV coordinates that will be map to the origin of the Texture Coordinates
         * @type {Vector2}
         */
        this.start = params.start !== undefined ? params.start.clone() : new Vector2(0, 0);

        /**
         * Scaling factor applied the the UV Coordinates before using them as Texture Coordinates
         * @type {Vector2}
         */
        this.scale = params.scale !== undefined ? params.scale.clone() : new Vector2(1, 1);
    }

    get uniformType() {
        return 'SimpleTextureMaterial';
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
        return mustache.render(render, this);
    }

}