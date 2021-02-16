import {MathUtils} from "../../lib/three.module.js";
import {mustache} from "../../lib/mustache.mjs";
import creeping from "./shaders/creeping.js";

const regexpTest = /bool\s*(\w+)\(Point.*\)/m;
const regexpCreep = /ExtVector\s*(\w+)\(ExtVector.*\)/m;

/**
 * @class
 *
 * @classdesc
 * A teleportation is a tool to bring back a point in a prescribed fundamental domain of a discrete group.
 * It consists of a test to decide if teleportation is needed and the group element to apply to teleport the point
 */
export class Teleportation {

    /**
     * Constructor
     * @param {Function} jsTest - A JS test saying if a teleportation is needed.
     * The test is a function with the signature Point -> boolean.
     * @param {string} glslTest - a chunk of GLSL performing the same test.
     * The test should be encapsulated in a function with signature Point -> bool
     * @param {GroupElement} elt - the isometry to apply when teleporting
     * @param {GroupElement} inv - the inverse of the isometry (optional)
     * If the inverse is not passed as an argument, it is computed automatically.
     * @param {string} glslCreep -  a chunk of GLSL to move to the boundary defined by the test
     */
    constructor(jsTest, glslTest, elt, inv = undefined, glslCreep = undefined) {
        let aux;
        /**
         * Universal unique ID.
         * The dashes are replaced by underscored to avoid problems in the shaders
         * @type {string}
         * @readonly
         */
        this.uuid = MathUtils.generateUUID().replaceAll('-', '_');
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
         * Name of the GLSL function performing the test.
         * Computed with a regular expression
         * @type {string}
         */
        this.glslTestName = undefined;
        aux = glslTest.match(regexpTest);
        if (!aux) {
            throw new Error('Teleportation: unable to find the name of the GLSL test');
        } else {
            this.glslTestName = aux[1];
        }

        /**
         * The element to apply when teleporting
         * @type {GroupElement}
         */
        this.elt = elt;

        /**
         * The inverse of the  teleporting element
         * @type {GroupElement}
         */
        this.inv = inv !== undefined ? inv : elt.clone().invert();
        /**
         * Say if the creeping uses a custom function of the default one
         * The two functions do not have the same signature.
         * @type {boolean}
         */
        this.glslCreepCustom = undefined;
        /**
         * Chunk of GLSL to move to the boundary defined by the test
         * @type {string}
         */
        this.glslCreep = undefined;
        /**
         * Name of the GLSL function performing the test.
         * Computed with a regular expression
         * @type {string}
         */
        this.glslCreepName = undefined;

        if (glslCreep !== undefined) {
            this.glslCreepCustom = true;
            this.glslCreep = glslCreep;
            aux = glslCreep.match(regexpCreep);
            if (!aux) {
                throw new Error('Teleportation: unable to find the name of the GLSL creep');
            } else {
                this.glslCreepName = aux[1];
            }
        } else {
            this.glslCreepCustom = false;
            this.glslCreepName = `creep${this.uuid}`;
            this.glslCreep = mustache.render(creeping, this);
        }

    }

    /**
     * The name of the item.
     * This name is computed (from the uuid) the first time the getter is called.
     * @type {string}
     */
    get name() {
        if (this._name === undefined) {
            this._name = `teleportation_${this.uuid}`;
        }
        return this._name;
    }

    /**
     * Build the GLSL code performing the associated test.
     * @param {ShaderBuilder} shaderBuilder
     * @param {boolean} usesCreeping
     */
    shader(shaderBuilder,  usesCreeping) {
        shaderBuilder.addChunk(this.glslTest);
        if (usesCreeping) {
            shaderBuilder.addChunk(this.glslCreep);
        }
        //shaderBuilder.addChunk("//pre elt");
        shaderBuilder.addUniform(this.elt.name, 'GroupElement', this.elt);
        //shaderBuilder.addChunk("//interlude");
        shaderBuilder.addUniform(this.elt.name, 'GroupElement', this.inv);
        //shaderBuilder.addChunk("//post inv");
    }
}