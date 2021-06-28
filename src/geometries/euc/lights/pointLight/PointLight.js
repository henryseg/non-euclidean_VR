import {Color} from "three";

import {Light} from "../../../../core/lights/Light.js";

import struct from "./shaders/struct.glsl";
import directions from "../../../../core/lights/shaders/directions.glsl.mustache";
import lightIntensity from "../../imports/lightIntensity.glsl";


/**
 * @class
 *
 * @classdesc
 * Point light
 */
export class PointLight extends Light {

    /**
     * Constructor
     * @param {Point} position - the position of the light
     * @param {Color} color - the color of the light
     * @param {number} intensity - the intensity of the light
     */
    constructor(position, color, intensity = 1) {
        super(1);
        /**
         * The position of the light.
         * @type {Point}
         */
        this.position = position;
        /**
         * The color of the light.
         * @type {Color}
         */
        this.color = color;
        /**
         * The intensity of the light.
         * @type {number}
         */
        this.intensity = intensity;
        this.addImport(lightIntensity);
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    get uniformType() {
        return 'PointLight';
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