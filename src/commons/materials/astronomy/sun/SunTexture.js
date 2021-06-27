import {Vector2} from "three";

import {SimpleTextureMaterial} from "../../simpleTexture/SimpleTextureMaterial.js";

import texture from "./img/2k_sun.jpg";

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
}