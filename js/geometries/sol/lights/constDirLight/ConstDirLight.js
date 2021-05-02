import {mustache} from "../../../../lib/mustache.mjs";
import {Color} from "../../../../lib/three.module.js";

import {Light} from "../../../../core/lights/Light.js";

import struct from "./shaders/struct.js";
import directions from "./shaders/directions.js";


/**
 * @class
 *
 * @classdesc
 * Light at infinity in the E-direction
 */
export class ConstDirLight extends Light {

    /**
     * Constructor.
     * @param {Color} color - the color of the light
     * @param {Vector3} direction - the direction of the light. It should be on of the following values:
     * - -1 (light coming from the negative direction)
     * - +1 (light coming from the positive direction)
     */
    constructor(color, direction) {
        super(1);
        this.color = color;
        this.direction = direction;
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    get uniformType() {
        return 'ConstDirLight';
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