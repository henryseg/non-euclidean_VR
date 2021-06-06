import {mustache} from "../../lib/mustache.mjs";
import {
    FloatType,
    LinearFilter,
    Mesh, NearestFilter, RGBAFormat, RGBFormat,
    ShaderMaterial,
    SphereBufferGeometry, Uniform, UniformsUtils,
    WebGLRenderTarget
} from "../../lib/threejs/build/three.module.js";
import {EffectComposer} from "../../lib/threejs/examples/jsm/postprocessing/EffectComposer.js";
import {TexturePass} from "../../lib/threejs/examples/jsm/postprocessing/TexturePass.js";
import {ShaderPass} from "../../lib/threejs/examples/jsm/postprocessing/ShaderPass.js";
import {FullScreenQuad} from "../../lib/threejs/examples/jsm/postprocessing/Pass.js";

import {AbstractRenderer} from "./AbstractRenderer.js";
import {PATHTRACER_RENDERER, ShaderBuilder} from "../../utils/ShaderBuilder.js";

import vertexShader from "./shaders/common/vertex.js";
import constants from "./shaders/common/constants.js";
import commons1 from "../geometry/shaders/commons1.js";
import commons2 from "../geometry/shaders/commons2.js";
import scenes from "./shaders/common/scenes.js";
import raymarch from "./shaders/common/raymarch.js";
import random1 from "./shaders/pathTracer/random1.js";
import random2 from "./shaders/pathTracer/random2.js";
import structVectorData from "./shaders/pathTracer/vectorDataStruct.js";
import updateVectorData from "./shaders/pathTracer/vectorDataUpdate.js";
import main from "./shaders/pathTracer/main.js";

import SteveShader from "../../postProcess/steve/shader.js";
import {HorizontalBlurShader} from "../../lib/threejs/examples/jsm/shaders/HorizontalBlurShader.js";
import {VerticalBlurShader} from "../../lib/threejs/examples/jsm/shaders/VerticalBlurShader.js";


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

const rtParameters = {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RGBAFormat,
    type: FloatType,
};

export class PathTracerRenderer extends AbstractRenderer {

    /**
     * Constructor.
     * @param {Object} geom - the underlying geometry
     * @param {TeleportationSet} set - the underlying teleportation set
     * @param {BasicCamera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the Thurston part of the renderer
     * @param {WebGLRenderer|Object} threeRenderer - parameters for the underlying Three.js renderer
     */
    constructor(geom, set, camera, scene, params = {}, threeRenderer = {}) {
        super(geom, set, camera, scene, params, threeRenderer);
        // different default value for the number of time we bounce
        this.maxBounces = params.maxBounces !== undefined ? params.maxBounces : 50;

        /**
         * Builder for the fragment shader.
         * @type {ShaderBuilder}
         * @private
         */
        this._fragmentBuilder = new ShaderBuilder(PATHTRACER_RENDERER);

        this.sceneTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters);
        this.accReadTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters);
        this.accWriteTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters);
        /**
         * Index of the frame (used to average the picture in the accumulation)
         * @type {number}
         */
        this.iFrame = 0;
        this.displayComposer = new EffectComposer(this.threeRenderer);
    }

    setPixelRatio(value) {
        super.setPixelRatio(value);
        this.displayComposer.setPixelRatio(value);
    }

    setSize(width, height, updateStyle = true) {
        super.setSize(width, height, updateStyle);
        this.sceneTarget.setSize(width, height);
        this.accReadTarget.setSize(width, height);
        this.accWriteTarget.setSize(width, height);
        this.displayComposer.setSize(width, height);
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
        this._fragmentBuilder.addUniform('maxBounces', 'int', this.maxBounces);
        // geometry
        this._fragmentBuilder.addChunk(this.geom.shader1);
        this._fragmentBuilder.addChunk(commons1);
        this._fragmentBuilder.addChunk(this.geom.shader2);
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
        this._fragmentBuilder.addChunk(mustache.render(scenes, this));
        this._fragmentBuilder.addChunk(mustache.render(updateVectorData, this));

        // ray-march and main
        this._fragmentBuilder.addChunk(raymarch);
        this._fragmentBuilder.addChunk(main);
    }

    /**
     * Build the Three.js scene with the non-euclidean shader.
     * @return {PathTracerRenderer}
     */
    build() {
        // The lag that may occurs when we move the sphere to chase the camera can be the source of noisy movement.
        // We put a very large sphere around the user, to minimize this effect.
        const geometry = new SphereBufferGeometry(1000, 60, 40);
        // flip the sphere inside out
        geometry.scale(1, 1, -1);

        this.buildFragmentShader();
        const material = new ShaderMaterial({
            uniforms: this._fragmentBuilder.uniforms,
            vertexShader: vertexShader,
            fragmentShader: this._fragmentBuilder.code,
        });
        const horizonSphere = new Mesh(geometry, material);
        this.threeScene.add(horizonSphere);

        this.displayComposer.addPass(new TexturePass(this.accReadTarget.texture));
        this.displayComposer.addPass(new ShaderPass(SteveShader));

        return this;
    }

    checkShader() {
        console.log(this._fragmentBuilder.code);
    }

    render() {
        let accTmpTarget;

        this.threeRenderer.setRenderTarget(this.sceneTarget);
        this.threeRenderer.render(this.threeScene, this.camera.threeCamera);

        this.threeRenderer.setRenderTarget(this.accWriteTarget);
        accumulateMat.uniforms['accTex'].value = this.accReadTarget.texture;
        accumulateMat.uniforms['newTex'].value = this.sceneTarget.texture;
        accumulateMat.uniforms['iFrame'].value = this.iFrame;
        accumulateQuad.render(this.threeRenderer);

        accTmpTarget = this.accReadTarget;
        this.accReadTarget = this.accWriteTarget;
        this.accWriteTarget = accTmpTarget;
        //
        this.threeRenderer.setRenderTarget(null);
        this.displayComposer.render();
        this.iFrame = this.iFrame + 1;
    }
}