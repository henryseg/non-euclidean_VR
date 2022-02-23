import {Vector2} from "three";

import {SimpleTextureMaterial} from "../../simpleTexture/SimpleTextureMaterial.js";

import texture from "./img/earthmap2k.png";

/**
 * @class
 * @extends SimpleTextureMaterial
 *
 * @classdesc
 * Texture of the earth
 *
 */
export class EarthTexture extends SimpleTextureMaterial {

    constructor() {
        super(texture, {
            start: new Vector2(-Math.PI, 0),
            scale: new Vector2(1 / (2 * Math.PI), 1 / Math.PI),
        });
    }
}