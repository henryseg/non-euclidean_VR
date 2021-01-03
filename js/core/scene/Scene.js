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

    constructor(fog=undefined) {
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
        this.fog = fog
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
     * build the shader relative to the scene
     * @param {ShaderBuilder} shaderBuilder
     */
    shader(shaderBuilder) {
        shaderBuilder.addChunk(header);
        // run through all the objects in the scene and combine the relevant chunks of GLSL code.
        for (const light of this.lights) {
            light.shader(shaderBuilder);
        }
        for (const solid of this.solids) {
            solid.shader(shaderBuilder);
        }
        if(this.fog !== undefined){
            this.fog.shader(shaderBuilder);
        }
        shaderBuilder.addChunk(mustache.render(scenes, this));
    }
}