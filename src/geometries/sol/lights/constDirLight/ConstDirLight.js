import mustache from "mustache/mustache.mjs";
import {Color} from "three";

import {Light} from "../../../../core/lights/Light.js";

import struct from "./shaders/struct.js";
import directions from "./shaders/directions.js";


/**
 * @class
 *
 * @classdesc
 * Constant local direction
 */
export class ConstDirLight extends Light {

    /**
     * Constructor.
     * @param {Color} color - the color of the light
     * @param {number} intensity - the intensity of the light
     * @param {Vector3} direction - the direction of the light.
     */
    constructor(color, intensity = 1, direction) {
        super(1);
        this.color = color;
        this.intensity = intensity;
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