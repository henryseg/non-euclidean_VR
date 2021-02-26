/**
 * @class
 *
 * @classdesc
 * Tool to build shaders without redundancies in the imported chunks of code
 *
 */
export class ShaderBuilder {
    /**
     * Constructor.
     * The constructor does not take arguments.
     */
    constructor() {
        /**
         * The shader built shader code.
         * @type {string}
         */
        this.code = "";
        /**
         * The list of shader imports already included.
         * @type {string[]}
         */
        this.includedImports = [];
        /**
         * The list of classes already included.
         * @type {string[]}
         */
        this.includedClasses = [];
        /**
         * List of names of constants already included
         * @type {string[]}
         */
        this.includedConstants = [];
        /**
         * List of names of uniforms already included
         * @type {string[]}
         */
        this.includedUniforms = [];
        /**
         * List of names of instances already included
         * @type {string[]}
         */
        this.includedInstances = [];
        /**
         * An object with all the uniforms to pass to the shader.
         * @type {{}}
         */
        this.uniforms = {};
    }

    /**
     * Add the given chunk (without any prior test)
     * @param {string} code
     * @return {ShaderBuilder} - the current shader builder
     */
    addChunk(code) {
        this.code = this.code + "\r\n\r\n" + code;
        return this;
    }

    /**
     * Incorporate the given import (if it does not already exists)
     * @param {string} imp - the import to add
     * @return {ShaderBuilder} - the current shader builder
     */
    addImport(imp) {
        if (!this.includedImports.includes(imp)) {
            this.includedImports.push(imp);
            this.code = this.code + "\r\n\r\n" + imp;
        }
        return this;
    }

    /**
     * Incorporate the given dependency (if it does not already exists)
     * @param {string} name - the name of the class
     * @param {string} code - the code of the class
     * @return {ShaderBuilder} - the current shader builder
     */
    addClass(name, code) {
        if (!this.includedClasses.includes(name)) {
            this.includedClasses.push(name);
            this.code = this.code + "\r\n\r\n" + code;
        }
        return this;
    }

    /**
     * Add a constant to the shader code.
     * @param {string} name - the name of the constant
     * @param {string} type - the GLSL type of the constant
     * @param {*} value - the JS value of the constant
     * @return {ShaderBuilder} - the current shader builder
     */
    addConstant(name, type, value) {
        if (!this.includedConstants.includes(name)) {
            this.includedConstants.push(name);
            this.code = this.code + "\r\n\r\n" + `const ${type} ${name} = ${value};`;
        }
        return this;
    }

    /**
     * Add a uniform variable to the shader code.
     * Update the object listing all the uniforms
     * @param {string} name - the name of the uniform
     * @param {string} type - the GLSL type of the uniform
     * @param {*} value - the JS value of the uniform
     * @return {ShaderBuilder} - the current shader builder
     */
    addUniform(name, type, value) {
        if (!this.includedUniforms.includes(name)) {
            this.includedUniforms.push(name);
            this.code = this.code + "\r\n\r\n" + `uniform ${type} ${name};`;
            this.uniforms[name] = {type: type, value: value};
        }
        return this;
    }

    /**
     * Update the value of a previously defined uniform
     * @param {string} name - the name of the uniform
     * @param {*} value - the value of the uniform
     * @return {ShaderBuilder} - the current shader builder
     */
    updateUniform(name, value) {
        this.uniforms[name] = value;
        return this;
    }

    /**
     * Add the given code (related to a specific instance of a class).
     * Check before (using name) that the code has not been included before.
     * @param {string} name - the name of the instance
     * @param {string} code - the code of the instance
     * @return {ShaderBuilder}
     */
    addInstance(name, code) {
        if (!this.includedInstances.includes(name)) {
            this.includedInstances.push(name);
            this.code = this.code + "\r\n\r\n" + code;
        }
        return this;
    }
}