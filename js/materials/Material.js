import {MathUtils} from "../lib/three.module";
import {mustache} from "../lib/mustache";

/**
 * @class
 * @abstract
 *
 * @classdesc
 * Abstract class for materials
 */
class Material {


    /**
     *
     * @param {Object} data - the input data
     */
    constructor(data = {}) {
        /**
         * UUID of this object instance.
         * This gets automatically assigned, so this shouldn't be edited.
         * @type {String}
         */
        this.uuid = MathUtils.generateUUID().replaceAll('-', '_');
        /**
         * The GLSL code for the material
         * @type {Object}
         */
        this.glsl = {
            declare: undefined,
            setup: undefined,
            core: undefined
        };
        /**
         * The idea of the object in the scene
         * This is automatically set up when the object is added to the scene
         * @type{number}
         */
        this.id = undefined;
        this.lights = data.lights;
    }


    /**
     * Defines whether this material uses lighting.
     * Default is false.
     * @type {boolean}
     */
    get lights() {
        return this._lights;
    }

    set lights(value) {
        if (value === undefined) {
            this._lights = false;
        } else {
            this._lights = value;
        }
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
     * Return the path to the shader code of the material
     * @return {string} the path the the shader;
     * @todo The path is absolute with respect to the root of the server
     */
    get shaderSource() {
        throw new Error("This method need be overloaded.");
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
        const response = await fetch('../../shaders/materials/default.xml');
        const parser = new DOMParser();
        return parser.parseFromString(await response.text(), 'application/xml');
    }

    /**
     * build the GLSL code relative to the item (declaration, signed distance function and gradient)
     * @param {Object} globals - Global parameters needed to build the GLSL blocks
     * @return {Promise<void>}
     */
    async glslBuildData(globals = {}) {
        const xml = await this.loadGLSLTemplate();
        const selector = `material[class=${this.className}] shader`;
        const templates = xml.querySelectorAll(selector);
        let rendered;
        let type;
        for (const template of templates) {
            type = template.getAttribute('type');
            rendered = mustache.render(template.childNodes[0].nodeValue, this);
            switch (type) {
                case 'core':
                    // SDF for the solid
                    this.glsl[type] = `vec3 ${this.name}(RelVector v, RelVector normal){
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
        if ('core' in blocks) {
            // The core cannot be setup by default!
            throw new Error(`No core function for ${this.name}`);
        }

        const xml = await this.loadGLSLDefaultTemplate();
        let selector;
        let template;
        let rendered;
        for (const block of blocks) {
            selector = `material[class=default] shader[type=${block}]`;
            template = xml.querySelector(selector);
            rendered = mustache.render(template.childNodes[0].nodeValue, this);
            switch (block) {
                default:
                    this.glsl[block] = rendered;
            }
        }
    }
}


export {Material};
