import {Vector2} from "three";

import {SimpleTextureMaterial} from "../../simpleTexture/SimpleTextureMaterial.js";

import texture from "./img/2k_sun.jpg";
import struct from "./shaders/struct.glsl";

/**
 * @class
 * @extends SimpleTextureMaterial
 *
 * @classdesc
 * Texture of the sun
 * Image from https://www.solarsystemscope.com/textures/
 */
export class SunTexture extends SimpleTextureMaterial {

    constructor() {
        super(texture, {
            start: new Vector2(-Math.PI, 0),
            scale: new Vector2(1 / (2 * Math.PI), 1 / Math.PI),
        });
    }

    get uniformType() {
        return 'SunTextureMaterial';
    }

    static glslClass() {
        return struct;
    }
}