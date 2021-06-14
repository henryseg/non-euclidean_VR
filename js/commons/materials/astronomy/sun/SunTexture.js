import {Vector2} from "three";

import {SimpleTextureMaterial} from "../../simpleTexture/SimpleTextureMaterial.js";


/**
 * @class
 * @extends SimpleTextureMaterial
 *
 * @classdesc
 * Texture of the sun
 * Image from https://www.solarsystemscope.com/textures/
 */
export class SunTexture extends SimpleTextureMaterial {

    constructor(thurstonJSPath) {
        super(thurstonJSPath + '/commons/materials/astronomy/sun/img/2k_sun.jpg', {
            start: new Vector2(-Math.PI, 0),
            scale: new Vector2(1 / (2 * Math.PI), 1 / Math.PI),
        });
    }
}