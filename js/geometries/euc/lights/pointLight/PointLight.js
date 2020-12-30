import {mustache} from "../../../../lib/mustache.mjs";
import {Color} from "../../../../lib/three.module.js";
import {Light} from "../../../../core/lights/Light.js";
import struct from "./shaders/struct.js";
import directions from "./shaders/directions.js";
import lightIntensity from "../../imports/lightIntensity.js";


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
     */
    constructor(position, color) {
        super(1);
        /**
         * The position of the light.
         * @type {Point}
         */
        this.position = position;
        /**
         * The color or the light.
         * @type {Color}
         */
        this.color = color;
        this.addImport(lightIntensity);
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

    get uniformType(){
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