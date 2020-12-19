import {Color} from "../../lib/three.module.js";
import {mustache} from "../../lib/mustache.mjs";
import {ObjectThurston} from "./ObjectThruston.js";


/**
 * @class
 * @extends ObjectThurston
 *
 * @classdesc
 * Generic class for point lights in the scene.
 * @todo How do we handle light intensity
 */
class Light extends ObjectThurston {


    /**
     * Constructor.
     * @param {Object} data
     * @todo Decide what arguments the generic constructor should receive
     */
    constructor(data = {}) {
        super(data);
        this.color = data.color;
        this.maxDirs = data.maxDirs;
        this.glsl = {
            declare: undefined,
            setup: undefined,
            direction: undefined
        };
    }

    /**
     * Color of the light
     * @type {Color}
     */
    get color() {
        return this._color;
    }

    set color(value) {
        if (value === undefined) {
            this._color = new Color(1, 1, 1);
        } else {
            this._color = value;
        }
    }

    /**
     * Maximal number of directions returned at each point
     * @return {number}
     */
    get maxDirs() {
        return this._maxDirs;
    }

    set maxDirs(value) {
        if (value === undefined) {
            this._maxDirs = 1;
        } else {
            this._maxDirs = value;
        }
    }

    /**
     * Say if the item is a light
     * @return {boolean} true
     */
    isLight() {
        return true;
    }

    /**
     * Say if the item is an objects
     * @return {boolean} false
     */
    isSolid() {
        return false;
    }

    /**
     * Return a block of GLSL code recreating the same light as a Light
     * @return {string}
     */
    toGLSL() {
        return `Light(
            ${super.toGLSL()},
            vec3(${this._color.toArray()})
        )`;
    }

    /**
     * build the GLSL code relative to the item (declaration, signed distance function and gradient)
     * @param {Object} globals - Global parameters needed to build the GLSL blocks
     * @return {Promise<void>}
     */
    async glslBuildData(globals) {
        const xml = await this.loadGLSLTemplate();
        const selector = `light[class=${this.className}] shader`;
        const templates = xml.querySelectorAll(selector);
        let rendered;
        let type;
        for (const template of templates) {
            type = template.getAttribute('type');
            rendered = mustache.render(template.childNodes[0].nodeValue, this);
            switch (type) {
                case 'direction':
                    // direction field for a light
                    this.glsl[type] = `int ${this.name}Dir(RelVector v, out RelVector[${globals.maxLightDirs}] dirs, out float[${globals.maxLightDirs}] intensities){
                        ${rendered}
                    }`
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
        if ('direction' in blocks) {
            // The direction field cannot be setup by default!
            throw new Error(`No direction field for ${this.name}`);
        }

        const xml = await this.loadGLSLDefaultTemplate();

        let selector;
        let template;
        let rendered;
        for(const block of blocks){
            selector = `light[class=default] shader[type=${block}]`;
            template = xml.querySelector(selector);
            rendered = mustache.render(template.childNodes[0].nodeValue, this);
            switch(block) {
                default:
                    this.glsl[block] = rendered;
            }
        }
    }
}

export {
    Light
}