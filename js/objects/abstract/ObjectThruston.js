import {MathUtils} from "../../lib/three.module.js";
import {Position} from "../../geometry/abstract/Position.js";

/**
 * @class
 * @abstract
 *
 * @classdesc
 * Generic class for objects in the scene (solids, lights, etc)
 * This class should never be instantiated directly.
 */
class ObjectThurston {
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
         * The GLSL code for the object (declaration, signed distance function, gradient, direction field, etc)
         * @type {Object}
         */
        this.glsl = undefined;
        /**
         * The idea of the object in the scene
         * This is automatically set up when the object is added to the scene
         * @type{number}
         */
        this.id = undefined;
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
     * @todo The path is absolute with respect to the root of the server
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
        return `ObjectThurston(
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
        const response = await fetch('../../shaders/objects/default.xml');
        const parser = new DOMParser();
        return parser.parseFromString(await response.text(), 'application/xml');
    }
}


export {
    ObjectThurston
};