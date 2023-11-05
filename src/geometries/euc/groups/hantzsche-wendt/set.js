import {Vector4} from "three";

import {Group} from "./Group.js";
import {TeleportationSet} from "../../../../core/teleportations/TeleportationSet.js";


const group = new Group();

/**
 * group elements for the teleportations arranged in pairs: elt1, elt1^{-1}, elt2, elt2^{-1}, etc
 * @type {GroupElement[]}
 */
const isoms = [
    group.element().setRotation(1, -1, -1).setTranslation(1, 1, 0), // A
    group.element().setRotation(1, -1, -1).setTranslation(-1, 1, 0), // A^{-1}
    group.element().setRotation(-1, 1, -1).setTranslation(0, 1, 1), // B
    group.element().setRotation(-1, 1, -1).setTranslation(0, -1, 1), // B^{-1}
    group.element().setRotation(-1, -1, 1).setTranslation(1, 0, 1), // C
    group.element().setRotation(-1, -1, 1).setTranslation(1, 0, -1), // C^{-1}
    group.element().setRotation(1, -1, -1).setTranslation(-1, -1, 0), // B^{-1}C
    group.element().setRotation(1, -1, -1).setTranslation(1, -1, 0), // C^{-1}B
    group.element().setRotation(-1, 1, -1).setTranslation(0, -1, -1), // C^{-1}A
    group.element().setRotation(-1, 1, -1).setTranslation(0, 1, -1), // A^{-1}C
    group.element().setRotation(-1, -1, 1).setTranslation(-1, 0, -1), // A^{-1}B
    group.element().setRotation(-1, -1, 1).setTranslation(-1, 0, 1), // B^{-1}A
]

/**
 * Data to create the teleportations
 * Each line is a triple (normal, isom, isomInv) with
 * - the normal to the face to test if we have left the fundamental domain. The normal is point outside
 * - the isometry to teleport
 * - the inverse of this isometry
 * @type {Array}
 */
const teleportationsData = [
    [new Vector4(-1, 1, 0, -group.length), isoms[0], isoms[1]],
    [new Vector4(1, 1, 0, -group.length), isoms[1], isoms[0]],
    [new Vector4(0, -1, 1, -group.length), isoms[2], isoms[3]],
    [new Vector4(0, 1, 1, -group.length), isoms[3], isoms[2]],
    [new Vector4(1, 0, -1, -group.length), isoms[4], isoms[5]],
    [new Vector4(1, 0, 1, -group.length), isoms[5], isoms[4]],
    [new Vector4(1, -1, 0, -group.length), isoms[6], isoms[7]],
    [new Vector4(-1, -1, 0, -group.length), isoms[7], isoms[6]],
    [new Vector4(0, 1, -1, -group.length), isoms[8], isoms[9]],
    [new Vector4(0, -1, -1, -group.length), isoms[9], isoms[8]],
    [new Vector4(-1, 0, 1, -group.length), isoms[10], isoms[11]],
    [new Vector4(-1, 0, -1, -group.length), isoms[11], isoms[10]]
]

const teleportations = new TeleportationSet();

for (let i = 0; i < teleportationsData.length; i++) {
    const [n, shift, inv] = teleportationsData[i];

    /**
     * Test if we have exit the fundamental domain through the face characterized by its normal `n`
     * @param {Point} p - the current point
     * @return {boolean} - return True or False
     */
    const test = function (p) {
        return p.coords.dot(n) > 0;
    }

    /**
     * GLSL version of the test
     * @type {string}
     */
    // language=GLSL
    const glslTest = `//
    bool test${i}(Point p){
        vec4 normal = vec4(${n.x}, ${n.y}, ${n.z}, ${n.w});
        return dot(p.coords, normal) > 0.;
    }
    `;

    // creating the new teleportation
    teleportations.add(test, glslTest, shift, inv);
}


export default teleportations;