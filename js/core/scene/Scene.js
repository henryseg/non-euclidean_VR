import {mustache} from "../../lib/mustache.mjs";

import scenes from "../renderers/shaders/scenes.js";
import header from "./shaders/header.js";
import {Color} from "../../lib/threejs/build/three.module.js";


/**
 * @class
 *
 * @classdesc
 * Non-euclidean scene.
 * All the objects added to the scene should belong to the same geometry
 */
export class Scene {

    /**
     * Constructor.
     * @param {Object} params - parameters of the scene including
     * - {Fog} fog - the fog in the scene
     * - {number} maxBounces - the maximal number of times the light bounces on reflecting materials.
     */
    constructor(params = {}) {
        /**
         * List of all the lights in the scene.
         * @type {Light[]}
         */
        this.lights = [];

        /**
         * List of all the solids in the scene.
         * @type {Solid[]}
         */
        this.solids = [];

        /**
         * Next available ID in the scene.
         * @type {number}
         */
        this.nextId = 0;

        /**
         * Fog in the scene
         * @type{Fog}
         */
        this.fog = params.fog;

        /**
         * Maximal number of bounces
         * @type {number}
         */
        this.maxBounces = params.maxBounces !== undefined ? params.maxBounces : 0;

        /**
         * Background color
         * @type{Color}
         */
        this.background = params.background !== undefined ? params.background : new Color(0.1, 0.1, 0.1);
    }

    /**
     * Add exactly one object to the scene
     * @param {Solid|Light} obj - the object to add to the scene
     * @return {Scene} the current scene
     */
    _add(obj) {
        // setup the id for the object
        obj.setId(this);
        // run the callback
        obj.onAdd(this);
        // add the object to the appropriate list
        if (obj.isLight) {
            this.lights.push(obj);
        }
        if (obj.isSolid) {
            this.solids.push(obj);
        }
        return this;
    }

    /**
     * Add one or more object in the scene
     * @param {...(Solid|Light)} obj - the objects to add
     * @return {Scene} the current scene
     */
    add(obj) {
        for (const obj of arguments) {
            this._add(obj);
        }
        return this;
    }

    /**
     * Build the shader relative to the scene.
     * Only the dependencies (solids, shapes, materials, lights, etc) are loaded here.
     * The scenes SDF (local and global) are built at the Renderer level.
     * Indeed these chunk need to know what is the teleportation set to implement nearest neighbors
     * Another strategy would be to link the scene to the teleportation set (in the constructor for instance)
     * @param {ShaderBuilder} shaderBuilder
     */
    shader(shaderBuilder) {
        shaderBuilder.addChunk(header);
        shaderBuilder.addUniform('scene', 'Scene', this);
        // run through all the objects in the scene and combine the relevant chunks of GLSL code.
        for (const light of this.lights) {
            light.shader(shaderBuilder);
        }
        for (const solid of this.solids) {
            solid.shader(shaderBuilder);
        }
        if (this.fog !== undefined) {
            this.fog.shader(shaderBuilder);
        }
    }
}