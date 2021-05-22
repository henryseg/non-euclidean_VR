import {mustache} from "../../../../lib/mustache.mjs";
import {Color} from "../../../../lib/threejs/build/three.module.js";
import {Light} from "../../../../core/lights/Light.js";

import distance from "../../imports/distance.js";
import direction from "../../imports/direction.js";
import lightIntensity from "../../imports/lightIntensity.js";
import struct from "./shaders/struct.js";
import directions from "./shaders/directions.js";
import {Isometry} from "../../../../core/geometry/Isometry.js";
import {Point} from "../../../../core/geometry/Point.js";


/**
 * @class
 *
 * @classdesc
 * Spherical point light
 */
export class PointLight extends Light {

    /**
     * Constructor
     * @param {Point|Vector} position - data for the position of the light
     * - If the input in a Point, then the position is that point.
     * - If the input is a Vector, then the position is the image of this vector by the exponential map at the origin.
     * @param {Color} color - the color of the light
     */
    constructor(position, color) {
        super(2);
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
         * The color or the light.
         * @type {Color}
         */
        this.color = color;
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