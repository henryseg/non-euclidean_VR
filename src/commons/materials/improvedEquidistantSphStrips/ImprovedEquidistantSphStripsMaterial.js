import {Color, Quaternion, Matrix4} from "three";

import {Material} from "../../../core/materials/Material.js";

import struct from "./shaders/struct.glsl";
import render from "../../../core/materials/shaders/renderUV.glsl.mustache";

/**
 * @class
 * @extends Material
 *
 * @classdesc
 * Strips on a sphere.
 * Coordinates correspond to spherical coordinates (theta, phi) with phi = 0 representing the North Pole
 * The strips are delimited by equidistant lines to geodesics orthogonal to the equator {phi = pi/2}
 * Strips are removed as the geodesics converges
 *
 * @todo Factor the shader functions also appearing in `EquidistantHypStripsMaterial`
 *
 */
export class ImprovedEquidistantSphStripsMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {number} distance - distance between two strips
     * @param {number} halfWidth - with of the strip
     * @param {number} fadingAmplitude - amplitude of the fading
     * @param {Color} stripColor - color of the strip
     * @param {Color} bgColor - color in between the group
     * @param {Quaternion} quaternion - quaternion to eventually rotate the texture
     * (when this cannot be done by an isometry of the space)
     * by default the identity
     */
    constructor(distance, halfWidth, fadingAmplitude, stripColor, bgColor, quaternion = undefined) {
        super();

        this.distance = distance;
        this.halfWidth = halfWidth;
        this.fadingAmplitude = fadingAmplitude;
        this.stripColor = stripColor;
        this.bgColor = bgColor;

        /**
         * Quaternion representing the rotation to apply
         * @type {Quaternion}
         */
        this.quaternion = quaternion !== undefined ? quaternion : new Quaternion();
    }

    /**
     * Return the rotation to apply represented as a Matrix4
     * (or more precisely its inverse)
     * @type {Matrix4}
     */
    get rotation() {
        return new Matrix4()
            .makeRotationFromQuaternion(this.quaternion)
            .invert();
    }

    get cosHalfWidthSq() {
        const cosHalfWidth = Math.cos(this.halfWidth);
        return cosHalfWidth * cosHalfWidth;
    }

    get uniformType() {
        return 'ImprovedEquidistantSphStripsMaterial';
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