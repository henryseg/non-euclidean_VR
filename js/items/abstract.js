/**
 * @module ThurstonItems
 *
 * @description
 * Add to the Thurston module a library of items (objects, lights, etc)
 */

import {
    mustache
} from '../lib/mustache.mjs';

import {
    Color
} from '../lib/three.module.js'

import {
    Point,
    Position
} from '../geometry/abstract.js'

import {
    Material
} from '../material.js'

import {
    MathUtils
} from "../lib/three.module.js";

/**
 * @class
 * @abstract
 *
 * @classdesc
 * Generic class for items in the scene (solids, lights, etc)
 * This class should never be instantiated directly.
 */
class Item {
    /**
     * Constructor.
     * @param {Object} data - the parameters of this item
     */
    constructor(data = {}) {
        this.position = data.position;
        this.global = data.global;
        /**
         * UUID of this object instance.
         * This gets automatically assigned, so this shouldn't be edited.
         * @type {String}
         */
        this.uuid = MathUtils.generateUUID().replaceAll('-', '_');
        /**
         * The GLSL code for the item (declaration, signed distance function and gradient)
         * @type {Object}
         */
        this.glsl = undefined;
    }

    /**
     * The position of the object
     * @type {Position}
     */
    get position() {
        return this._position;
    }

    set position(value) {
        if (value === undefined) {
            this._position = new Position();
        } else {
            this._position = value;
        }
    }

    /**
     * Flag: true, if the item is global
     * @type {boolean}
     */
    get global() {
        return this._global;
    }

    set global(value) {
        if (value === undefined) {
            this._global = true;
        } else {
            this._global = value;
        }
    }

    /**
     * Flag: true, if the item is local (i.e. in a quotient manifold/orbifold)
     * @type {boolean}
     */
    get local() {
        return !this.global;
    }

    /**
     * Return the path to the shader code of the item
     * @return {string} the path the the shader;
     * @todo The path is relative to the file 'thurston.js'. Look at good practices for handling paths
     */
    get shaderSource() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Say if the item is a light
     * @return {boolean} true if the item is a light
     */
    isLight() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Say if the item is an solid
     * @return {boolean} true if the item is an solid
     */
    isSolid() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * The name of the class (with first letter lower case).
     * Useful to generate the name of items
     * @return {string}
     */
    get className() {
        const name = this.constructor.name;
        return name[0].toLowerCase() + name.substr(1);
    }

    /**
     * The name of the item.
     * This name is computed (from the id) the first time the getter is called.
     * This getter should not be called before the item has received an id.
     * @type {string}
     */
    get name() {
        if (this._name === undefined) {
            this._name = `${this.className}_${this.uuid}`;
        }
        return this._name;
    }

    /**
     * The underlying point of the item's position
     * @type {Point}
     */
    get point() {
        return this._position.point;
    }


    /**
     * Return a block of GLSL code recreating the same item as an Item
     * @return {string}
     */
    toGLSL() {
        return `Item(
            ${this.position.toGLSL()},
            ${this.point.toGLSL()}
            )`;
    }

    /**
     * Load the XML file containing the GLSL blocks of code.
     * Return the XML as a DOM
     * @return {Promise<Document>}
     */
    async loadGLSLTemplate() {
        const response = await fetch(this.shaderSource);
        const parser = new DOMParser();
        return parser.parseFromString(await response.text(), 'application/xml');
    }

    /**
     * Load the XML file containing the GLSL blocks of code.
     * Return the XML as a DOM
     * @return {Promise<Document>}
     */
    async loadGLSLDefaultTemplate() {
        const response = await fetch('../../shaders/items/default.xml');
        const parser = new DOMParser();
        return parser.parseFromString(await response.text(), 'application/xml');
    }
}


/**
 * @class
 * @extends Item
 *
 * @classdesc
 * Generic class for objects in the scene
 * The class is named Solid, as Object is a built-in name in Javascript
 * This class should never be instantiated directly.
 * Classes that inherit from Object can be instantiated.
 */

class Solid extends Item {


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


/**
 * @class
 * @extends Item
 *
 * @classdesc
 * Generic class for point lights in the scene.
 * @todo How do we handle light intensity
 */
class Light extends Item {


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
    Item,
    Solid,
    Light
}
