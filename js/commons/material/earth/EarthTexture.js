import {Vector2} from "../../../lib/threejs/build/three.module.js";

import {SimpleTextureMaterial} from "../simpleTexture/SimpleTextureMaterial.js";


/**
 * @class
 * @extends SimpleTextureMaterial
 *
 * @classdesc
 * Texture of the earth
 */
export class EarthTexture extends SimpleTextureMaterial {

    constructor(thurstonJSPath) {
        super(thurstonJSPath + '/commons/material/earth/img/earthmap2k.png', {
            start: new Vector2(-Math.PI, 0),
            scale: new Vector2(1 / (2 * Math.PI), 1 / Math.PI),
        });
    }
}