import {mustache} from "../../../../lib/mustache.mjs";
import {Color} from "../../../../lib/three.module.js";

import {Light} from "../../../../core/lights/Light.js";

import direction from "../../imports/direction.js";
import distance from "../../imports/distance.js";
import lightIntensity from "../../imports/lightIntensity.js";

import struct from "./shaders/struct.js";
import directions from "./shaders/directions.js";



/**
 * @class
 *
 * @classdesc
 * Light at infinity in the positive E-direction
 */
export class PointLight extends Light {

    /**
     * Constructor
     * @param {Color} color - the color of the light
     * @param {Point} position - the position of the light
     */
    constructor(color, position) {
        super(1);
        this.color = color;
        this.position = position;
        this.addImport(distance, direction, lightIntensity);
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
        return mustache.render(directions, this);
    }
}