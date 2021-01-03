/**
 * @class
 * @abstract
 *
 * @classdesc
 * Defines a fog to be used in the scene.
 */
export class Fog {

    constructor() {

    }

    /**
     * Extend the given shader with the appropriate code
     * @abstract
     * @param {ShaderBuilder}  shaderBuilder - the shader builder
     */
    shader(shaderBuilder) {
        throw new Error('Fog: this method need be implemented');
    }
}