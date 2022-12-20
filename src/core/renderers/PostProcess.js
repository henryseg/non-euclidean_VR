import vertexPostProcess from "./shaders/common/vertexPostProcess.glsl";

/**
 * @class
 * @abstract
 *
 * @classdesc
 * A post process is a treatment apply to the picture obtained after rendering the geometry.
 * A post process defines 3 elements :
 * - its uniforms
 * - a vertex shader
 * - a fragment shader
 * Most of the time the vertex shader will be the same.
 * These data are packaged by the method `fullShader`
 */
export class PostProcess {

    constructor() {
    }

    /**
     * Return the uniforms needed in the fragment shader.
     * It is a good practice to extend the object return by the method of this abstract class.
     * tDiffuse is the texture containing the rendered geometry.
     * @return {Object} - an object with all the uniforms of the post process
     */
    uniforms() {
        return {'tDiffuse': {value: null}};
    }

    /**
     * @return {string} - the vertex shader
     */
    vertexShader() {
        return vertexPostProcess;
    }

    /**
     * @return {string} - the fragment shader
     */
    fragmentShader() {
        throw new Error('Shape: this method should be implemented');
    }

    /**
     *
     * @return {Object} - all the data needed by the Three.js `addPass` method.
     */
    fullShader() {
        return {
            uniforms: this.uniforms(),
            vertexShader: this.vertexShader(),
            fragmentShader: this.fragmentShader()
        }
    }
}