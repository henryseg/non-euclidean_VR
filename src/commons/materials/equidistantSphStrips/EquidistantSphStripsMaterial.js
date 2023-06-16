import {Color} from "three";

import {Material} from "../../../core/materials/Material.js";

import struct from "./shaders/struct.glsl";
import render from "../../../core/materials/shaders/renderUV.glsl.mustache";

/**
 * @class
 * @extends Material
 *
 * @classdesc
 * Strips on a surface representing a sphere.
 * Coordinates correspond to spherical coordinates (theta, phi) where phi = 0 is the North Pole.
 * The strips are delimited by equidistant lines to geodesics orthogonal to the equator {phi=pi/2}.
 *
 */
export class EquidistantSphStripsMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {number} distance - distance between two strips
     * @param {number} halfWidth - with of the strip
     * @param {Color} stripColor - color of the strip
     * @param {Color} bgColor - color in between the group
     */
    constructor(distance, halfWidth, stripColor, bgColor) {
        super();

        this.distance = distance;
        this.halfWidth = halfWidth;
        this.stripColor = stripColor;
        this.bgColor = bgColor;
    }

    get cosHalfWidthSq() {
        const cosHalfWidth = Math.cos(this.halfWidth);
        return cosHalfWidth * cosHalfWidth;
    }

    get uniformType() {
        return 'EquidistantSphStripsMaterial';
    }

    get usesNormal() {
        return false;
    }

    get usesUVMap() {
        return true;
    }

    static glslClass() {
        return struct;
    }

    glslRender() {
        return render(this);
    }
}