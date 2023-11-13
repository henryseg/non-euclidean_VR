import {
    NearestFilter, RGBAFormat, HalfFloatType,
    ShaderMaterial,
    Uniform, Vector2,
    WebGLRenderTarget
} from "three";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {TexturePass} from "three/examples/jsm/postprocessing/TexturePass.js";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass.js";
import {FullScreenQuad} from "three/examples/jsm/postprocessing/Pass.js";

import {Renderer} from "./Renderer.js";
import {PATHTRACER_RENDERER, ShaderBuilder} from "../../utils/ShaderBuilder.js";
import {CombinedPostProcess} from "../../commons/postProcess/combined/CombinedPostProcess.js";

import constants from "./shaders/common/constants.glsl";
import commons1 from "../geometry/shaders/commons1.glsl";
import commons2 from "../geometry/shaders/commons2.glsl";
import scenes from "./shaders/pathTracer/scenes.glsl.mustache";
import raymarch from "./shaders/pathTracer/raymarch.glsl";
import random1 from "./shaders/pathTracer/random1.glsl";
import random2 from "./shaders/pathTracer/random2.glsl";
import structVectorData from "./shaders/pathTracer/vectorDataStruct.glsl";
import updateVectorData from "./shaders/pathTracer/vectorDataUpdate.glsl.mustache";
import main from "./shaders/pathTracer/main.glsl";
import nextObject from "./shaders/pathTracer/nextObject.glsl.mustache";


const accumulateMat = new ShaderMaterial({
    uniforms: {
        accTex: new Uniform(null),
        newTex: new Uniform(null),
        iFrame: new Uniform(0)
    },
    // language=GLSL
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    // language=GLSL
    fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D accTex;
        uniform sampler2D newTex;
        uniform float iFrame;
        void main() {
            float den = 1./ (1. + iFrame);
            gl_FragColor = den * (iFrame *  texture2D(accTex, vUv) + texture2D(newTex, vUv));
        }`
});
const accumulateQuad = new FullScreenQuad(accumulateMat);

const RT_PARAMETERS = {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RGBAFormat,
    type: HalfFloatType,
};

export class PathTracerRenderer extends Renderer {

    /**
     * Constructor.
     * @param {PathTracerCamera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the Thurston part of the renderer
     * @param {WebGLRenderer|Object} threeRenderer - parameters for the underlying Three.js renderer
     */
    constructor(camera, scene, params = {}, threeRenderer = {}) {
        super(camera, scene, params, threeRenderer);
        // different default value for the number of time we bounce
        this.globalUniforms.maxBounces.value = params.maxBounces !== undefined ? params.maxBounces : 50;

        /**
         * Add post-processing to the final output
         * @type {PostProcess[]}
         */
        this.postProcess = params.postProcess !== undefined ? params.postProcess : [];
        if (this.postProcess.length === 0) {
            this.postProcess.push(new CombinedPostProcess())
        }

        /**
         * Builder for the fragment shader.
         * @type {ShaderBuilder}
         * @private
         */
        this._fragmentBuilder = new ShaderBuilder(PATHTRACER_RENDERER);

        this.sceneTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight, RT_PARAMETERS);
        this.accReadTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight, RT_PARAMETERS);
        this.accWriteTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight, RT_PARAMETERS);
        /**
         * Index of the frame (used to average the picture in the accumulation)
         * @type {number}
         */
        this.iFrame = 0;
        this.composer = new EffectComposer(this.threeRenderer);
    }

    get isPathTracerRenderer() {
        return true;
    }

    setPixelRatio(value) {
        super.setPixelRatio(value);
        this.composer.setPixelRatio(value);
    }

    setSize(width, height, updateStyle = true) {
        super.setSize(width, height, updateStyle);
        this.sceneTarget.setSize(width, height);
        this.accReadTarget.setSize(width, height);
        this.accWriteTarget.setSize(width, height);
        this.composer.setSize(width, height);
    }

    updateFrameSeed() {
        const seed = Math.floor(10000 * Math.random())
        this._fragmentBuilder.updateUniform('frameSeed', seed);
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

        const res = new Vector2(this.accWriteTarget.width, this.accWriteTarget.height);
        this._fragmentBuilder.addUniform('resolution', 'vec2', res);

        // geometry
        this._fragmentBuilder.addChunk(this.constructor.shader1);
        this._fragmentBuilder.addChunk(commons1);
        this._fragmentBuilder.addChunk(this.constructor.shader2);
        this._fragmentBuilder.addChunk(commons2);

        // methods for random data
        this._fragmentBuilder.addUniform('frameSeed', 'uint', Math.floor(10000 * Math.random()));
        this._fragmentBuilder.addChunk(random1);

        // vector data structure (for later use in ExtVector)
        this._fragmentBuilder.addChunk(structVectorData);

        // subgroup/quotient orbifold
        this.set.shader(this._fragmentBuilder);

        // complement of methods for random data
        this._fragmentBuilder.addChunk(random2);

        // camera
        this.camera.shader(this._fragmentBuilder);

        // scene
        this.scene.shader(this._fragmentBuilder);
        this._fragmentBuilder.addChunk(scenes(this));
        this._fragmentBuilder.addChunk(nextObject(this));
        this._fragmentBuilder.addChunk(updateVectorData(this));

        // ray-march and main
        this._fragmentBuilder.addChunk(raymarch);
        this._fragmentBuilder.addChunk(main);
    }

    build() {
        this.buildFragmentShader();
        this.camera.setThreeScene(this._fragmentBuilder);
        this.composer.addPass(new TexturePass(this.accReadTarget.texture));

        for (let i = 0; i < this.postProcess.length; i++) {
            const effectPass = new ShaderPass(this.postProcess[i].fullShader());
            effectPass.clear = false;
            this.composer.addPass(effectPass);
        }
    }

    checkShader() {
        console.log(this._fragmentBuilder.code);
    }

    /**
     * Render the accumulated target
     * (for display or download purposes)
     */
    renderAccTarget() {
        this.threeRenderer.setRenderTarget(null);
        this.composer.render();
    }

    render() {
        let accTmpTarget;
        this.updateFrameSeed();
        const res = new Vector2(this.accWriteTarget.width, this.accWriteTarget.height);
        this._fragmentBuilder.updateUniform('resolution', res);

        this.threeRenderer.setRenderTarget(this.sceneTarget);
        this.threeRenderer.render(this.camera.threeScene, this.camera.threeCamera);
        //
        this.threeRenderer.setRenderTarget(this.accWriteTarget);
        accumulateMat.uniforms['accTex'].value = this.accReadTarget.texture;
        accumulateMat.uniforms['newTex'].value = this.sceneTarget.texture;
        accumulateMat.uniforms['iFrame'].value = this.iFrame;
        accumulateQuad.render(this.threeRenderer);

        accTmpTarget = this.accReadTarget;
        this.accReadTarget = this.accWriteTarget;
        this.accWriteTarget = accTmpTarget;

        this.renderAccTarget();
        this.iFrame = this.iFrame + 1;
    }
}