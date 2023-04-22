import {
    LinearFilter,
    RepeatWrapping,
    VideoTexture,
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
 * A material given by a "double" video file
 * The file should consist of two videos stacked on top of one another
 * The video in the upper half part corresponds to the RGB channels
 * The video in the lower half part is a gray scale video encoding the alpha channel.
 */
export class VideoAlphaTextureMaterial extends Material {

    /**
     * Constructor
     * @param {HTMLVideoElement} videoElement - the element in the HTML file containing the video
     * @param {Object} params - options for the material
     */
    constructor(videoElement, params = {}) {
        super();
        /**
         * Texture built from the given image
         * @type {Texture}
         */
        this.sampler = new VideoTexture(videoElement);
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
        this.transparent = params.transparent !== undefined ? params.transparent : true;
    }

    get uniformType() {
        return 'VideoAlphaTextureMaterial';
    }

    get usesNormal() {
        return false;
    }

    get usesUVMap() {
        return true;
    }

    get isTransparent() {
        return this.transparent;
    }

    static glslClass() {
        return struct;
    }

    glslRender() {
        return render(this);
    }

}