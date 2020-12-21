import {Isometry} from "./Isometry.js";

/**
 * @class
 *
 * @classdesc
 * Elementary brick of a discrete subgroups.
 * We describe a discrete subgroups by a set of generators.
 * Each generator is seen as a "teleportation" (to move a point back in the fundamental domain).
 * A Teleport encode both the generator, and the test to decide if a teleportation is needed.
 */
export class Teleport {

    /**
     * Constructor
     * @param {Function} jsTest - A JS test saying if a teleportation is needed.
     * The test is a function with the signature Point -> boolean.
     * @param {string} glslTest - a chunk of GLSL performing the same test.
     * The test should be encapsulated in a function with signature Point -> bool,
     * whose name matches the one of the JS test.
     * @param {Isometry} isom - the isometry to apply when teleporting
     * @param {Isometry} inv - the inverse of the isometry (optional)
     * If the inverse is not passed as an argument, it is computed automatically.
     */
    constructor(jsTest, glslTest, isom, inv = undefined) {
        /**
         * A JS test saying if a teleportation is needed
         * The test is a function with the signature Point -> boolean
         * The test returns true if a teleportation is needed and false otherwise.
         * @type {Function}
         */
        this.jsTest = jsTest;
        /**
         * A GLSL test saying if a teleportation is needed
         * The test returns true if a teleportation is needed and false otherwise.
         * @type {string}
         */
        this.glslTest = glslTest;
        /**
         * The isometry to apply when teleporting
         * @type {Isometry}
         */
        this.isom = isom;
        /**
         * The inverse of the  teleporting isometry
         * @type {Isometry}
         */
        this.inv = undefined;
        if (inv === undefined) {
            this.inv = isom.clone().invert();
        } else {
            this.inv = inv;
        }
    }

    /**
     * The name of the JS test function serves as name/ID for the Teleport
     * @return {string}
     */
    get name() {
        return this.jsTest.name;
    }
}
