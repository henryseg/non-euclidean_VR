import {mustache} from "../../../../lib/mustache.mjs";
import {Color} from "../../../../lib/three.module.js";

import {Light} from "../../../../core/lights/Light.js";

import struct from "./shaders/struct.js";
import directions from "./shaders/directions.js";

/**
 * @class
 *
 * @classdesc
 * Light at infinity in the positive E-direction
 */
export class ESun extends Light {

    /**
     * Constructor.
     * @param {Color} color - the color of the light
     */
    constructor(color) {
        super(1);
        this.color = color;
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    get uniformType(){
        return 'ESun';
    }

    /**
     * Return the chunk of GLSL code defining the corresponding structure.
     * @abstract
     * @return {string}
     */
    static glslClass() {
        return struct;
    }

    glslDirections() {
        return mustache.render(directions, this);
    }
}