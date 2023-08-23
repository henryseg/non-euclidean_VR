import {Color} from "three";

import {Light} from "../../../../core/lights/Light.js";

import struct from "./shaders/struct.glsl";
import directions from "../../../../core/lights/shaders/directions.glsl.mustache";

const DIR_UP = 1;
const DIR_DOWN = -1;

/**
 * @class
 *
 * @classdesc
 * Light at infinity in the E-direction
 */
export class LocalFakePointLight extends Light {

    /**
     * Constructor.
     * @param {Color} color - the color of the light
     * @param {number} intensity - the intensity of the light
     * @param {Point} position - the direction of the light. It should be on of the following values:
     * - -1 (light coming from the negative direction)
     * - +1 (light coming from the positive direction)
     */
    constructor(color, intensity = 1, position) {
        super(1);
        this.color = color;
        this.intensity = intensity;
        this.position = position;
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    get uniformType() {
        return 'LocalFakePointLight';
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