import {Color} from "three";

import {Material} from "../../../core/materials/Material.js";

import struct from "./shaders/struct.glsl";
import render from "../../../core/materials/shaders/renderUV.glsl.mustache";

/**
 * @class
 * @extends Material
 *
 * @classdesc
 * Strips on a surface representing the hyperbolic plane.
 * Coordinates correspond to the Klein model
 * The strips are delimited by equidistant lines to geodesics orthogonal to the x-axis.
 * New strips are added as the geodesics diverge
 *
 * @todo Factor the shader functions also appearing in `EquidistantHypStripsMaterial`
 *
 */
export class ImprovedEquidistantHypStripsMaterial extends Material {

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

    get uniformType() {
        return 'ImprovedEquidistantHypStripsMaterial';
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