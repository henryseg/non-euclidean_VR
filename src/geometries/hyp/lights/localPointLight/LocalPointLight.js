import {Color} from "three";
import {Light} from "../../../../core/lights/Light.js";

import struct from "./shaders/struct.glsl";
import direction from "../../imports/direction.glsl";
import directions from "../../../../core/lights/shaders/directions.glsl.mustache";
import distance from "../../imports/distance.glsl";
import lightIntensity from "../../imports/lightIntensity.glsl";
import {Isometry} from "../../../../core/geometry/Isometry.js";
import {Point} from "../../../../core/geometry/Point.js";


/**
 * @class
 *
 * @classdesc
 * Point light
 */
export class LocalPointLight extends Light {

    /**
     * Constructor
     * @param {Point|Vector} position - data for the position of the light
     * - If the input in a Point, then the position is that point.
     * - If the input is a Vector, then the position is the image of this vector by the exponential map at the origin.
     * @param {Color} color - the color of the light
     * @param {number} intensity - the intensity of the light
     */
    constructor(position, color, intensity = 1) {
        super(1);
        /**
         * The position of the light.
         * @type {Point}
         */
        this.position = undefined;
        if (position.isPoint) {
            this.position = position;
        } else if (position.isVector) {
            const isom = new Isometry().makeTranslationFromDir(position);
            this.position = new Point().applyIsometry(isom);
        } else {
            throw new Error('BallShape: this type is not allowed');
        }


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
        this.addImport(distance, direction, lightIntensity);
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
        return 'LocalPointLight';
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