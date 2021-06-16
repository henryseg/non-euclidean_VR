import {Color} from "three";
import mustache from "mustache/mustache.mjs";
import {Light} from "../../../../core/lights/Light.js";

import fakeDistance from "../../imports/fakeDistance.js";
import struct from "./shaders/struct.js";
import directions from "./shaders/directions.js";

export class FakePointLight extends Light {

    /**
     * Constructor
     * @param {Point} position - position of the light
     * @param {Color} color - color of the light
     * @param {number} intensity - intensity of the light
     */
    constructor(position, color, intensity = 1) {
        super(1);
        this.addImport(fakeDistance);
        this.position = position;
        this.color = color;
        this.intensity = intensity;
    }

    get isGlobal() {
        return true;
    }

    get uniformType() {
        return 'FakePointLight';
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