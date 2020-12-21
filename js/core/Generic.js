import {MathUtils} from "../lib/three.module.js";

/**
 * @class
 * @abstract
 *
 * @classdesc
 * Generic class for Shape, Material, Solid, etc.
 * Factorize ID Management and other stuff.
 */
export class Generic {

    /**
     * Constructor.
     * The constructor takes no argument.
     */
    constructor() {
        /**
         * Universal unique ID.
         * The dashes are replaced by underscored to avoid problems in the shaders
         * @type {string}
         * @readonly
         */
        this.uuid = MathUtils.generateUUID().replaceAll('-', '_');
        /**
         * ID of the object in the scene
         * This number is computed automatically when the object is added to the scene.
         * It should not be changed
         * @type{number}
         * @readonly
         */
        this.id = undefined;
        /**
         * A list of GLSL code chunks that are needed for this shape (and could also be reused somewhere else).
         * Default is the empty list.
         * @type {string[]}
         */
        this.imports = [];
    }

    /**
     * The name of the class.
     * Useful to generate the name of items
     * @return {string}
     */
    get className() {
        return this.constructor.name;
    }

    /**
     * The name of the item.
     * This name is computed (from the uuid) the first time the getter is called.
     * @type {string}
     */
    get name() {
        if (this._name === undefined) {
            this._name = `${this.className}_${this.uuid}`;
        }
        return this._name;
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        throw new Error('Generic: this method should be implemented');
    }

    /**
     * Says whether the shape is local. True if local, false otherwise
     * @type {boolean}
     */
    get isLocal() {
        return !this.isGlobal;
    }

    /**
     * Return the type under which the data is passed as uniform.
     * Return the empty string, if the data should not be passed as a uniform.
     * @return {string}
     */
    get uniformType() {
        return '';
    }

    /**
     * Set the ID of the shape.
     * Propagate the process if needed
     * @param {number} id - the first available ID
     * @return {number} - the next available id after all IDs have been assigned
     */
    setId(id) {
        this.id = id;
        return id + 1;
    }


    /**
     * Extend the list of imports
     * @param {...string} imports - the imports to add
     */
    addImport(imports) {
        for (const imp of arguments) {
            if (!(imp in this.imports)) {
                this.imports.push(imp);
            }
        }
    }

    /**
     * Return the chunk of GLSL code defining the corresponding structure,
     * And eventually basic functions associated to the structure.
     * @abstract
     * @return {string}
     */
    static glslStruct() {
        throw new Error('Generic: this function should be implemented');
    }

    /**
     * Compile all the function directly related to the object (e.g. sdf, gradient, direction field, etc).
     * @return {string}
     */
    glslLogic() {
        throw new Error('Generic: this function should be implemented');
    }

    /**
     * Extend the given shader with the appropriate code
     * @param {ShaderBuilder}  shaderBuilder - the shader builder
     */
    shader(shaderBuilder) {
        // add all the imports for this instance
        for (const imp of this.imports) {
            shaderBuilder.addImport(imp);
        }

        // add the struct dependencies (which only depends on the class and not the instance)
        shaderBuilder.addDependency(this.constructor);

        // if needed declare the uniform for this instance
        if (this.uniformType !== '') {
            shaderBuilder.addUniform(this.name, this.uniformType, this);
        }

        // add the logic specific to this instance
        shaderBuilder.addChunk(this.glslLogic());
    }
}