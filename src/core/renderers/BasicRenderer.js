import {RenderPass} from "three/addons/postprocessing/RenderPass.js";
import {ShaderPass} from "three/addons/postprocessing/ShaderPass.js";
import {EffectComposer} from "three/addons/postprocessing/EffectComposer.js";

import {Renderer} from "./Renderer.js";
import {ShaderBuilder} from "../../utils/ShaderBuilder.js";

import constants from "./shaders/common/constants.glsl";
import commons1 from "../geometry/shaders/commons1.glsl";
import commons2 from "../geometry/shaders/commons2.glsl";
import raymarch from "./shaders/basic/raymarch.glsl";
import scenes from "./shaders/basic/scenes.glsl.mustache";
import structVectorData from "./shaders/basic/vectorDataStruct.glsl";
import updateVectorData from "./shaders/basic/vectorDataUpdate.glsl.mustache";
import postProcessVoid from "./shaders/basic/postProcessVoid.glsl";
import main from "./shaders/basic/main.glsl";


/**
 * @class
 *
 * @classdesc
 * Non-euclidean renderer.
 * Takes as input the non-euclidean camera and scene and makes some magic.
 * It should not be confused with the Three.js WebGLRenderer it relies on.
 *
 * This one is built with a spherical Three.js screen.
 * It is more convenient for virtual reality (see VRRenderer)
 * It should be used with a perspective Three.js camera
 */
export class BasicRenderer extends Renderer {

    /**
     * Constructor.
     * @param {string} shader1 - the first part of the geometry dependent shader
     * @param {string} shader2 - the second part of the geometry dependent shader
     * @param {Camera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the Thurston part of the renderer
     * @param {WebGLRenderer|Object} threeRenderer - parameters for the underlying Three.js renderer
     */
    constructor(shader1, shader2, camera, scene, params = {}, threeRenderer = {}) {
        super(shader1, shader2, camera, scene, params, threeRenderer);
        /**
         * Builder for the fragment shader.
         * @type {ShaderBuilder}
         * @private
         */
        this._fragmentBuilder = new ShaderBuilder();

        /**
         * Add post-processing to the final output
         * @type {PostProcess[]}
         */
        this.postProcess = params.postProcess !== undefined ? params.postProcess : [];
        /**
         * Effect composer for postprocessing
         * @type {EffectComposer}
         */
        this.composer = new EffectComposer(this.threeRenderer);
    }

    get isBasicRenderer() {
        return true;
    }

    setPixelRatio(value) {
        super.setPixelRatio(value);
        this.composer.setPixelRatio(value);
    }

    setSize(width, height, updateStyle = true) {
        super.setSize(width, height, updateStyle);
        this.composer.setSize(width, height);
    }

    /**
     * Build the fragment shader
     */
    buildFragmentShader() {

        // constants
        this._fragmentBuilder.addChunk(constants);
        Object.keys(this.globalUniforms).forEach(name => {
            const type = this.globalUniforms[name].type;
            const value = this.globalUniforms[name].value;
            this._fragmentBuilder.addUniform(name, type, value);
        });
        // geometry
        this._fragmentBuilder.addChunk(this.shader1);
        this._fragmentBuilder.addChunk(commons1);
        this._fragmentBuilder.addChunk(this.shader2);
        this._fragmentBuilder.addChunk(commons2);

        // data carried by ExtVector
        this._fragmentBuilder.addChunk(structVectorData);
        // subgroup/quotient orbifold
        this.set.shader(this._fragmentBuilder);

        // camera
        this.camera.shader(this._fragmentBuilder);

        // scene
        this.scene.shader(this._fragmentBuilder);
        this._fragmentBuilder.addChunk(scenes(this));
        this._fragmentBuilder.addChunk(updateVectorData(this));

        // ray-march and main
        this._fragmentBuilder.addChunk(raymarch);
        this._fragmentBuilder.addChunk(postProcessVoid);
        this._fragmentBuilder.addChunk(main);
    }

    /**
     * Build the Three.js scene with the non-euclidean shader.
     * @return {BasicRenderer}
     */
    build() {
        this.buildFragmentShader();
        this.camera.setThreeScene(this._fragmentBuilder);
        const renderPass = new RenderPass(this.camera.threeScene, this.camera.threeCamera);
        renderPass.clear = false;
        this.composer.addPass(renderPass);

        for (let i = 0; i < this.postProcess.length; i++) {
            const effectPass = new ShaderPass(this.postProcess[i].fullShader());
            effectPass.clear = false;
            this.composer.addPass(effectPass);
        }
        return this;
    }

    checkShader() {
        console.log(this._fragmentBuilder.code);
    }

    render() {
        this.composer.render();
    }
}