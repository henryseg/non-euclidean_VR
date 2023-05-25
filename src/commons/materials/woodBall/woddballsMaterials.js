import {Vector2} from "three";

import {SimpleTextureMaterial} from "../simpleTexture/SimpleTextureMaterial.js";

import eye0 from "./img/eye/eye_logo4.jpg";
import eye1 from "./img/eye/eye_logo4_cedar.jpg";
import eye2 from "./img/eye/eye_logo4_oak.jpg";
import eye3 from "./img/eye/eye_logo5.jpg";

import hand0 from "./img/hand/hand_logo2.jpg";
import hand1 from "./img/hand/hand_logo3.jpg";
import hand2 from "./img/hand/hand_logo3_darker.jpg";

/**
 * Return a SimpleTextureMaterial corresponding to the wood ball with an eye or hands on it.
 * @param {string} type - the type of the texture ("eye" or "hand")
 * @param {number} textureID - The id of a texture (among the ones available)
 */
export function woodBallMaterial(type, textureID) {
    let texture;
    switch (type) {
        case "eye":
            switch (textureID) {
                case 0:
                    texture = eye0;
                    break;
                case 1:
                    texture = eye1;
                    break;
                case 2:
                    texture = eye2;
                    break;
                case 3:
                    texture = eye3;
                    break;
                default:
                    throw new Error("WoodBallMaterial: this texture ID does not exists.");
            }
            break;
        case "hand":
            switch (textureID) {
                case 0:
                    texture = hand0;
                    break;
                case 1:
                    texture = hand1;
                    break;
                case 2:
                    texture = hand2;
                    break;
                default:
                    throw new Error("WoodBallMaterial: this texture ID does not exists.");
            }
            break;
        default:
            throw new Error("WoodBallMaterial: this type of texture is not implemented.");
    }

    return new SimpleTextureMaterial(texture, {
        start: new Vector2(-Math.PI, 0),
        scale: new Vector2(1 / (2 * Math.PI), 1 / Math.PI),
    });
}


