import {Vector2} from "three";

import {SimpleTextureMaterial} from "../../simpleTexture/SimpleTextureMaterial.js";
import struct from "./shaders/struct.glsl";

import texture0 from "./img/lroc_color_poles_2k.png";
import texture1 from "./img/2k_moon.jpg";

/**
 * @class
 * @extends SimpleTextureMaterial
 *
 * @classdesc
 * Texture of the moon
 * Image from https://svs.gsfc.nasa.gov/4720
 * Credits : NASA's Scientific Visualization Studio
 */
export class MoonTexture extends SimpleTextureMaterial {

    /**
     * Constructor
     * @param {number} textureID - The id of a texture (among the ones available)
     */
    constructor(textureID) {
        let texture;
        switch (textureID) {
            case 0:
                texture = texture0;
                break;
            case 1:
                texture = texture1;
                break;
            default:
                texture = texture0;
        }
        super(texture, {
            start: new Vector2(-Math.PI, 0),
            scale: new Vector2(1 / (2 * Math.PI), 1 / Math.PI),
        });
    }

    get uniformType() {
        return 'MoonTextureMaterial';
    }

    static glslClass() {
        return struct;
    }
}