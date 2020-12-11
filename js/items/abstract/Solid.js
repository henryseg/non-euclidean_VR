import {Material} from "../../Material.js";
import {mustache} from "../../lib/mustache.mjs";
import {ObjectThurston} from "./ObjectThruston.js";

/**
 * @class
 * @extends ObjectThurston
 *
 * @classdesc
 * Generic class for objects in the scene
 * The class is named Solid, as Object is a built-in name in Javascript
 * This class should never be instantiated directly.
 * Classes that inherit from Object can be instantiated.
 */

class Solid extends ObjectThurston {


    /**
     * Constructor.
     * @param {Object} data - the parameters of this object
     */
    constructor(data = {}) {
        super(data);
        this.material = data.material;
        this.glsl = {
            declare: undefined,
            setup: undefined,
            sdf: undefined,
            gradient: undefined
        };
    }

    /**
     * Material of the solid
     * @type {Material}
     */
    get material() {
        return this._material;
    }

    set material(value) {
        if (value === undefined) {
            this._material = new Material();
        } else {
            this._material = value;
        }
    }

    /**
     * Say if the item is a light
     * @return {boolean} false
     */
    isLight() {
        return false;
    }

    /**
     * Say if the item is an objects
     * @return {boolean} true
     */
    isSolid() {
        return true;
    }

    /**
     * Return a block of GLSL code recreating the same solid as a Solid
     * @return {string}
     */
    toGLSL() {
        return `Solid(
            ${super.toGLSL()},
            ${this._material.toGLSL()}
        )`;
    }

    /**
     * build the GLSL code relative to the item (declaration, signed distance function and gradient)
     * @param {Object} globals - Global parameters needed to build the GLSL blocks
     * @return {Promise<void>}
     */
    async glslBuildData(globals = {}) {
        const xml = await this.loadGLSLTemplate();
        const selector = `solid[class=${this.className}] shader`;
        const templates = xml.querySelectorAll(selector);
        let rendered;
        let type;
        for (const template of templates) {
            type = template.getAttribute('type');
            rendered = mustache.render(template.childNodes[0].nodeValue, this);
            switch (type) {
                case 'sdf':
                    // SDF for the solid
                    this.glsl[type] = `float ${this.name}SDF(RelVector v){
                        ${rendered}
                    }`;
                    break;
                case 'gradient':
                    // gradient of SDF for the solid
                    this.glsl[type] = `RelVector ${this.name}Grad(RelVector v){
                        ${rendered}
                    }`;
                    break;
                default:
                    this.glsl[type] = rendered;
            }
        }
        // List all the blocks that have not been assigned yet
        const missing = [];
        for (const block in this.glsl) {
            if (this.glsl.hasOwnProperty(block) && this.glsl[block] === undefined) {
                missing.push(block);
            }
        }
        await this.glslBuildDataDefault(globals, missing);
    }

    /**
     * Build the GLSL blocks listed in blocks using the default templates
     * @param {Object} globals - Global parameters needed to build the GLSL blocks
     * @param {String[]} blocks - The list of blocks that need to be built
     * @return {Promise<void>}
     */
    async glslBuildDataDefault(globals = {}, blocks) {
        if ('sdf' in blocks) {
            // The SDF cannot be setup by default!
            throw new Error(`No signed distance function for ${this.name}`);
        }

        const xml = await this.loadGLSLDefaultTemplate();

        let selector;
        let template;
        let rendered;
        for(const block of blocks){
            selector = `solid[class=default] shader[type=${block}]`;
            template = xml.querySelector(selector);
            rendered = mustache.render(template.childNodes[0].nodeValue, this);
            switch(block) {
                case 'gradient':
                    // gradient of SDF for the solid
                    this.glsl[block] = `RelVector ${this.name}Grad(RelVector v){
                        ${rendered}
                    }`;
                    break;
                default:
                    this.glsl[block] = rendered;
            }
        }
    }
}

export {
    Solid
}
