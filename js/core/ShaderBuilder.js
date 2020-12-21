/**
 * @class
 *
 * @classdesc
 * Tool to build shaders without redundancies in the imported chunks of code
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
         * @type {Function[]}
         */
        this.includedDependencies = [];
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
     * @param {Function} dependency - the dependency to add
     * @return {ShaderBuilder} - the current shader builder
     */
    addDependency(dependency) {
        if (!this.includedDependencies.includes(dependency)) {
            this.includedDependencies.push(dependency);
            this.code = this.code + "\r\n\r\n" + dependency.glslStruct();
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
        this.code = this.code + "\r\n\r\n" + `uniform ${type} ${name};`;
        this.uniforms[name] = {type: type, value: value};
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
}