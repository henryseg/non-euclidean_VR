import {MathUtils} from "../../lib/three.module.js";
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
class Teleport {

    /**
     * Constructor
     * @param {Function} test - A test saying if a teleportation is needed
     * @param {Isometry} isom - the isometry to apply when teleporting
     * @param {Isometry} inv - the inverse of the isometry (optional)
     * If the inverse is not passed as an argument, it is computed automatically.
     */
    constructor(test, isom, inv = undefined) {
        /**
         * A test saying if a teleportation is needed
         * The test is a function with the signature Point -> boolean
         * The test returns true if a teleportation is needed and false otherwise.
         * @type {Function}
         */
        this.test = test;
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
            this.inv = new Isometry().getInverse(isom);
        } else {
            this.inv = inv;
        }
        /**
         * UUID of this object instance.
         * This gets automatically assigned, so this shouldn't be edited.
         * @type {String}
         */
        this.uuid = MathUtils.generateUUID().replaceAll('-', '_');
        /**
         * A unique name, build from the uuid (private version).
         * This gets automatically assigned, so this shouldn't be edited.
         * @type {string}
         */
        this.name = `teleport_${this.uuid}`;
        /**
         * The GLSL code to perform the test.
         * (To be automatically setup at the subgroup level.)
         * @type {string}
         */
        this.glsl = undefined;
    }
}

export {
    Teleport
}