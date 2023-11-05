import {Color} from "three";

import {Light} from "../../../../core/lights/Light.js";

import fakeDirection from "../../imports/fakeDirection.glsl";
import fakeDistance from "../../imports/fakeDistance.glsl";
import lightIntensity from "../../imports/lightIntensity.glsl";

import struct from "./shaders/struct.glsl";
import directions from "../../../../core/lights/shaders/directions.glsl.mustache";


/**
 * @class
 *
 * @classdesc
 */
export class LocalFakePointLight extends Light {

    /**
     * Constructor
     * @param {Color} color - the color of the light
     * @param {Point} position - the position of the light
     * @param {number} intensity - the intensity of the light
     */
    constructor(color, position, intensity = 1) {
        super(1);
        this.color = color;
        this.intensity = intensity;
        this.position = position;
        this.addImport(fakeDistance, fakeDirection, lightIntensity);
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