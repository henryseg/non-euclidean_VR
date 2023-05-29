import {Vector2} from "three";

import {SimpleTextureMaterial} from "../simpleTexture/SimpleTextureMaterial.js";

import earth0 from "./img/earth/earthmap2k.png";
import earth1 from "./img/earth/Earth_NoClouds.jpg";

import moon0 from "./img/moon/lroc_color_poles_2k.png";
import moon1 from "./img/moon/2k_moon.jpg";

import mars0 from "./img/mars/2k_mars.jpg";

import sun0 from "./img/sun/2k_sun.jpg";

/**
 * Return a SimpleTextureMaterial corresponding to the earth
 * @param {number} textureID - The id of a texture (among the ones available)
 */
export function earthTexture(textureID) {
    let texture;
    switch (textureID) {
        case 0:
            texture = earth0;
            break;
        case 1:
            texture = earth1;
            break;
        default:
            texture = earth0;
    }

    return new SimpleTextureMaterial(texture, {
        start: new Vector2(-Math.PI, 0),
        // note the sign on the scaling factor
        // the reason comes from the fact that in our convention for spherical coordinates (theta, phi)
        // phi = 0 is mapped to the point (0,0,1) in cartesian coordinates
        // hence phi is a *decreasing* function of z,
        // which has the effect of reversing the orientation of the image file
        scale: new Vector2(1 / (2 * Math.PI), -1 / Math.PI),
    });
}


/**
 * Return a SimpleTextureMaterial corresponding to the moon
 * @param {number} textureID - The id of a texture (among the ones available)
 */
export function moonTexture(textureID) {
    let texture;
    switch (textureID) {
        case 0:
            texture = moon0;
            break;
        case 1:
            texture = moon1;
            break;
        default:
            texture = moon0;
    }

    return new SimpleTextureMaterial(texture, {
        start: new Vector2(-Math.PI, 0),
        scale: new Vector2(1 / (2 * Math.PI), -1 / Math.PI),
    });
}

/**
 * Return a SimpleTextureMaterial corresponding to Mars
 */
export function marsTexture() {
    return new SimpleTextureMaterial(mars0, {
        start: new Vector2(-Math.PI, 0),
        scale: new Vector2(1 / (2 * Math.PI), -1 / Math.PI),
    });
}

/**
 * Return a SimpleTextureMaterial corresponding to the sun
 */
export function sunTexture(textureID) {
    return new SimpleTextureMaterial(sun0, {
        start: new Vector2(-Math.PI, 0),
        scale: new Vector2(1 / (2 * Math.PI), -1 / Math.PI),
    });
}
