import {
    LinearFilter,
    RepeatWrapping,
    TextureLoader,
    Texture,
    ImageLoader,
    Vector2
} from "three";

import {Material} from "../../../core/materials/Material.js";

import struct from "./shaders/struct.glsl";
import render from "../../../core/materials/shaders/renderUV.glsl.mustache";


const REFRESH_READY = 0;
const REFRESH_IN_PROGRESS = 1;
const REFRESH_COMPLETE = 2;

/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material given by a series of image files (handled as a "video").
 * The files are prescribed by a JSON object whose property "files" is the list of the image files
 * The prefix, is the eventual prefix for the path of the files
 *
 */
export class VideoFrameTextureMaterial extends Material {

    /**
     * Constructor
     * @param {Array<string>} files - a list of all the frame files
     * @param {string} prefix - the prefix for the path to the files
     * @param {Object} params - options for the material
     */
    constructor(files, prefix, params = {}) {
        super();

        /**
         * List of files, each file correspond to a frame
         * @type {Array<string>}
         */
        this.files = files;

        /**
         * Number of frames
         * @type {number}
         */
        this.frameNumber = files.length;

        /**
         * Texture built from the given image
         * @type {Texture}
         */
        this.sampler = new Texture();
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

        /**
         * Says if the video should be looped
         * @type {boolean}
         */
        this.loop = params.loop !== undefined ? params.loop : false;

        /**
         * Says if the video should be looped
         * @type {boolean}
         */
        this.loop = params.loop !== undefined ? params.loop : false;

        /**
         * A callback called at each time a frame is loaded
         * @type {Function}
         */
        this.callback = params.callback !== undefined ? params.callback : function () {
        };

        /**
         * Number of frame per second
         * @type {number}
         */
        this.fps = params.fps !== undefined ? params.fps : false;

        /**
         * Status of the image
         * 0 - refresh ready. The texture is ready to load the next frame
         * 1 - refresh in progress. The call for the next frame has been sent, waiting for the file to be loaded
         * @type {number}
         */
        this.imageStatus = REFRESH_READY;

        /**
         * Image Loader
         */
        this.imageLoader = new ImageLoader();
        this.imageLoader.setPath(prefix);

        this.currentFrame = 0;

    }

    /**
     * Return the index of the frame, corresponding to the given time (in ms).
     * @param {number} time - the time in ms
     * @returns {number} - the index of the frame
     */
    frameIndex(time) {
        let index = Math.floor(time * this.fps);
        if (this.loop) {
            index = index % this.frameNumber;
        } else {
            index = Math.min(index, this.frameNumber - 1)
        }
        return index
    }


    nextFrameIndex(index) {
        if (this.loop) {
            return (index + 1) % this.frameNumber;
        } else {
            return Math.min(index + 1, this.frameNumber - 1)
        }
    }

    /**
     * Load the frame corresponding to the given time.
     * @param {number} time - the current time (in ms)
     */
    loadFrame(time) {
        if (this.imageStatus === REFRESH_READY) {

            this.imageStatus = REFRESH_IN_PROGRESS;
            const index = this.frameIndex(time);
            console.log('frame index ', index);
            const url = this.files[index];

            const texture = this;
            this.imageLoader.load(
                url,
                function (image) {
                    texture.sampler.image = image;
                    texture.sampler.needsUpdate = true;
                    texture.imageStatus = REFRESH_COMPLETE;
                    texture.callback();
                },
                undefined,
                function () {
                    console.log(`Cannot load the file ${url}`);
                }
            );
        }
    }

    /**
     * Load the next file as the image texture,
     * and update the current frame index
     */
    nextFrame() {
        if (this.imageStatus === REFRESH_READY) {

            this.imageStatus = REFRESH_IN_PROGRESS;
            const url = this.files[this.currentFrame];
            this.currentFrame = this.nextFrameIndex(this.currentFrame);

            const texture = this;
            this.imageLoader.load(
                url,
                function (image) {
                    texture.sampler.image = image;
                    texture.sampler.needsUpdate = true;
                    texture.imageStatus = REFRESH_COMPLETE;
                },
                undefined,
                function () {
                    console.log(`Cannot load the file ${url}`);
                }
            );
        }
    }

    get uniformType() {
        return 'VideoFrameTextureMaterial';
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