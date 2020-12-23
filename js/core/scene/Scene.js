import {mustache} from "../../lib/mustache.mjs";

import scenes from "./shaders/scenes.js";
import header from "./shaders/header.js";


/**
 * @class
 *
 * @classdesc
 * Non-euclidean scene.
 * All the objects added to the scene should belong to the same geometry
 */
export class Scene {

    constructor() {
        /**
         * List of all the lights in the scene.
         * @type {Light[]}
         * @private
         */
        this._lights = [];
        /**
         * List of all the solids in the scene.
         * @type {Solid[]}
         * @private
         */
        this._solids = [];
        /**
         * Next available ID in the scene.
         * @type {number}
         * @private
         */
        this._nextId = 0;
    }

    /**
     * Add exactly one object to the scene
     * @param {Solid|Light} obj - the object to add to the scene
     * @return {Scene} the current scene
     */
    _add(obj) {
        // setup the id for the object
        this._nextId = obj.setId(this._nextId);
        // add the object to the appropriate list
        if (obj.isLight) {
            this._lights.push(obj);
        }
        if (obj.isSolid) {
            this._solids.push(obj);
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
     * build the shader relative to the scene
     * @param {ShaderBuilder} shaderBuilder
     */
    shader(shaderBuilder) {
        shaderBuilder.addChunk(header);
        // run through all the objects in the scene and combine the relevant chunks of GLSL code.
        for (const light of this._lights) {
            light.shader(shaderBuilder);
        }
        for (const solid of this._solids) {
            solid.shader(shaderBuilder);
        }
        shaderBuilder.addChunk(mustache.render(scenes, this));
    }
}