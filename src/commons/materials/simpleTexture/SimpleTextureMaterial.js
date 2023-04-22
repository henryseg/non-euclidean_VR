import {
    LinearFilter,
    RepeatWrapping,
    TextureLoader,
    Vector2
} from "three";

import {Material} from "../../../core/materials/Material.js";

import struct from "./shaders/struct.glsl";
import render from "../../../core/materials/shaders/renderUV.glsl.mustache";


/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material given by an image file
 *
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
         * Point in the UV coordinates that will be mapped to the origin of the Texture Coordinates
         * @type {Vector2}
         */
        this.start = params.start !== undefined ? params.start.clone() : new Vector2(0, 0);

        /**
         * Scaling factor applied to the UV Coordinates before using them as Texture Coordinates
         * @type {Vector2}
         */
        this.scale = params.scale !== undefined ? params.scale.clone() : new Vector2(1, 1);

        /**
         * Says if the texture has an alpha channel that need be taken into account
         * @type {boolean}
         */
        this._isTransparent = params.isTransparent !== undefined ? params.isTransparent : false;
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

    get isTransparent() {
        return this._isTransparent;
    }

    static glslClass() {
        return struct;
    }

    glslRender() {
        return render(this);
    }

}