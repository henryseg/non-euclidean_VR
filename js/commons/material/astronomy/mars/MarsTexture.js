import {Vector2} from "../../../../lib/threejs/build/three.module.js";

import {SimpleTextureMaterial} from "../../simpleTexture/SimpleTextureMaterial.js";


/**
 * @class
 * @extends SimpleTextureMaterial
 *
 * @classdesc
 * Texture of Mars
 * Image from https://www.solarsystemscope.com/textures/
 *
 */
export class MarsTexture extends SimpleTextureMaterial {

    constructor(thurstonJSPath) {
        super(thurstonJSPath + '/commons/material/astronomy/mars/img/2k_mars.jpg', {
            start: new Vector2(-Math.PI, 0),
            scale: new Vector2(1 / (2 * Math.PI), 1 / Math.PI),
        });
    }
}