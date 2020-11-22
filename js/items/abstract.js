/**
 * @module Thurston Items
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

/**
 * @class
 *
 * @classdesc
 * Generic class for items in the scene (solids, lights, etc)
 * This class should never be instantiated directly.
 *
 * @property {number} id - an ID (to be set when the object is added to the scene)
 * @property {boolean} global  - is the object local or global
 * @property {Position} position - position of the object
 * @property {string} _name - a unique name, build from the id (private version)
 * @property {Point} _location - the image of the origin by the position, to avoid redundant computations (private version)
 *
 */
class Item {

    /**
     * Constructor.
     * @param {Object} data - the parameters of this item
     */
    constructor(data = {}) {
        const def = this.default();
        for (const property in def) {
            if (property in data) {
                this[property] = data[property];
            } else {
                this[property] = def[property];
            }
        }

        // properties to be setup later
        this.id = undefined;
        this._name = undefined;
        this._location = undefined;
        this.glsl = {
            declare: undefined,
            setup: undefined,
            sdf: undefined,
        };

    }

    default() {
        /**
         * Return the list of all default values of the parameters
         * that should be setup during the construction.
         * The list should be expanded by classes that inherit from Item.
         */
        return {
            global: true,
            position: new Position()
        }
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
     * Say if the item is an objects
     * @return {boolean} true if the item is an object
     */
    isSolid() {
        throw new Error("This method need be overloaded.");
    }

    get className() {
        const name = this.constructor.name;
        return name[0].toLowerCase() + name.substr(1);
    }

    get name() {
        if (this._name === undefined) {
            this._name = this.className + this.id;
            // just for fun, on can add a random suffix to the name
            /*
            this._name = this._name + '-' + Math.random().toString(16).substr(2, 8);
            */

        }
        return this._name;
    }

    get location() {
        if (this._location === undefined) {
            this._location = new Point().applyIsometry(this.position.boost);
        }
        return this._location;
    }

    toGLSL() {
        return `Item(
            ${this.id}, 
            ${this.position.boost.toGLSL()},
            ${this.position.facing.toGLSL()},
            ${this.location.toGLSL()}
            )`;
    }

    async glslBuildData() {
        const response = await fetch(this.shaderSource);
        const parser = new DOMParser();
        const xml = parser.parseFromString(await response.text(), 'application/xml');

        let tag;
        if (this.isSolid()) {
            tag = 'solid';
        }
        if (this.isLight()) {
            tag = 'light';
        }
        const selector = `${tag}[class=${this.className}] shader`;
        const templates = xml.querySelectorAll(selector);
        let rendered;
        let type;
        for (const template of templates) {
            type = template.getAttribute('type');
            rendered = mustache.render(template.childNodes[0].nodeValue, this);
            switch (type) {
                case 'sdf':
                    this.glsl[type] = `float ${this.name}SDF(Vector v){
                        ${rendered}
                    }`;
                    break;
                case 'gradient':
                    this.glsl[type] = `Vector ${this.name}Grad(Vector v){
                        ${rendered}
                    }`;
                    break;
                default:
                    this.glsl[type] = rendered;
            }
        }
    }
}


/**
 * @class
 *
 * @classdesc
 * Generic class for objects in the scene
 * The class is named Solid, as Object is a built-in name in Javascript
 * This class should never be instantiated directly.
 * Classes that inherit from Object can be instantiated.
 *
 * @property {Material}  material - private storing of `material`
 */

class Solid extends Item {

    /**
     * Constructor.
     * @param {Object} data - the parameters of this object
     * @todo Decide what arguments the generic constructor should receive
     */
    constructor(data = {}) {
        super(data);
    }

    default() {
        const res = super.default();
        return Object.assign(res, {material: new Material()});
    }

    /**
     * Say if the item is a light
     * @return {boolean} true if the item is a light
     */
    isLight() {
        return false;
    }

    /**
     * Say if the item is an objects
     * @return {boolean} true if the item is an object
     */
    isSolid() {
        return true;
    }

    toGLSL() {
        return `Solid(
            ${super.toGLSL()},
            ${this.material.toGLSL()}
        )`;
    }
}


/**
 * @class
 *
 * @classdesc
 * Generic class for point lights in the scene.
 *
 * @property {Color}  color - private storing for color
 *
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
    }

    default() {
        const res = super.default();
        return Object.assign(res, {color: new Color(1, 1, 1)});
    }

    /**
     * Say if the item is a light
     * @return {boolean} true if the item is a light
     */
    isLight() {
        return true;
    }

    /**
     * Say if the item is an objects
     * @return {boolean} true if the item is an object
     */
    isSolid() {
        return false;
    }

    toGLSL() {
        return `Light(
            ${super.toGLSL()},
            vec3(${this.color.toArray()})
        )`;
    }
}


export {
    Item,
    Solid,
    Light
}
