import {Color, Vector4} from "three";

import {Light} from "../../../../core/lights/Light.js";

import struct from "./shaders/struct.glsl";
import directions from "../../../../core/lights/shaders/directions.glsl.mustache";

/**
 * @class
 *
 * @classdesc
 * Light at a fixed direction
 */
export class DirLight extends Light {

    /**
     * Constructor.
     * @param {Color} color - the color of the light
     * @param {number} intensity - the intensity of the light
     * @param {Vector4} direction - the direction of the light.
     */
    constructor(color, intensity = 1, direction = undefined) {
        super(1);
        this.color = color;
        this.intensity = intensity;
        this.direction = direction !== undefined ? direction.clone().normalize() : new Vector4(0,0,0,1);
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    get uniformType() {
        return 'DirLight';
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
        return directions(this);
    }
}