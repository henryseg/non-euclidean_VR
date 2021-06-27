import {Vector2} from "three";

import {SimpleTextureMaterial} from "../../simpleTexture/SimpleTextureMaterial.js";

import texture from "./img/lroc_color_poles_2k.png";

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

    constructor() {
        super(texture, {
            start: new Vector2(-Math.PI, 0),
            scale: new Vector2(1 / (2 * Math.PI), 1 / Math.PI),
        });
    }
}