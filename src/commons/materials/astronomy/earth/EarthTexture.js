import {Vector2} from "three";

import {SimpleTextureMaterial} from "../../simpleTexture/SimpleTextureMaterial.js";
import struct from "./shaders/struct.glsl";

import texture0 from "./img/earthmap2k.png";
import texture1 from "./img/Earth_NoClouds.jpg"


/**
 * @class
 * @extends SimpleTextureMaterial
 *
 * @classdesc
 * Texture of the earth
 *
 */
export class EarthTexture extends SimpleTextureMaterial {

    /**
     * Constructor
     * @param {number} textureID - The id of a texture (among the ones available)
     */
    constructor(textureID = 0) {
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
        return 'EarthTextureMaterial';
    }

    static glslClass() {
        return struct;
    }
}