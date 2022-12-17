import {Color, Vector4} from "three";
import {Light} from "../../../../core/lights/Light.js";

import struct from "./shaders/struct.glsl";
import directions from "../../../../core/lights/shaders/directions.glsl.mustache";
import {Point} from "../../../../core/geometry/Point.js";


/**
 * @class
 *
 * @classdesc
 * Point light
 */
export class SunLight extends Light {

    /**
     * Constructor
     * @param {Vector3} position - position of the light.
     * The light is a point at infinity with coordinates [u_x, u_y,u_z, 1], where u = (u_x,u_y_u_z) is unit vector in the same direction.
     * @param {Color} color - the color of the light
     * @param {number} intensity - the intensity of the light
     */
    constructor(position, color, intensity = 1) {
        super(1);
        /**
         * The position of the light.
         * @type {Point}
         */
        const aux = position.clone().normalize();
        this.position = new Vector4(aux.x, aux.y, aux.z, 1);
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
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    /**
     * Says whether the shape is local. True if local, false otherwise
     * @type {boolean}
     */
    get isLocal() {
        return !this.isGlobal;
    }

    get uniformType() {
        return 'SunLight';
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