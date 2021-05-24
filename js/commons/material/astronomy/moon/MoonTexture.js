import {Vector2} from "../../../../lib/threejs/build/three.module.js";

import {SimpleTextureMaterial} from "../../simpleTexture/SimpleTextureMaterial.js";


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

    constructor(thurstonJSPath) {
        super(thurstonJSPath + '/commons/material/astronomy/moon/img/lroc_color_poles_2k.png', {
            start: new Vector2(-Math.PI, 0),
            scale: new Vector2(1 / (2 * Math.PI), 1 / Math.PI),
        });
    }
}