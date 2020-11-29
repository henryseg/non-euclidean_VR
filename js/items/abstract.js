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
         * A unique ID (to be set when the object is added to the scene)
         * @type {number}
         */
        this.id = undefined;
        /**
         * The GLSL code for the item (declaration, signed distance function and gradient)
         * @type {Object}
         */
        this.glsl = {
            declare: undefined,
            setup: undefined,
            sdf: undefined,
        };

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
            this._name = this.className + this.id;
            // just for fun, on can add a random suffix to the name
            // in case somebody used accidentally the same name.
            this._name = this._name + '_' + Math.random().toString(16).substr(2, 8);
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
            ${this.id}, 
            ${this.position.toGLSL()},
            ${this.point.toGLSL()}
            )`;
    }

    /**
     * build the GLSL code relative to the item (declaration, signed distance function and gradient)
     * @return {Promise<void>}
     */
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
                    this.glsl[type] = `float ${this.name}SDF(RelVector v){
                        ${rendered}
                    }`;
                    break;
                case 'gradient':
                    this.glsl[type] = `RelVector ${this.name}Grad(RelVector v){
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
            this._color = new Color(1,1,1);
        } else {
            this._color = value;
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
}


export {
    Item,
    Solid,
    Light
}
