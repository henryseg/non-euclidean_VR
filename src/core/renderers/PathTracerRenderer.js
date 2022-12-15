import {
    FloatType,
    Mesh, NearestFilter, RGBAFormat,
    ShaderMaterial,
    SphereGeometry, Uniform, Vector2,
    WebGLRenderTarget
} from "three";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {TexturePass} from "three/examples/jsm/postprocessing/TexturePass.js";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass.js";
import {FullScreenQuad} from "three/examples/jsm/postprocessing/EffectComposer.js";

import {AbstractRenderer} from "./AbstractRenderer.js";
import {PATHTRACER_RENDERER, ShaderBuilder} from "../../utils/ShaderBuilder.js";

import vertexShader from "./shaders/common/vertex.glsl";
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

import SteveShader from "../../postProcess/steve/shader.js";
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

const rtParameters = {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RGBAFormat,
    type: FloatType,
};

export class PathTracerRenderer extends AbstractRenderer {

    /**
     * Constructor.
     * @param {string} shader1 - the first part of the geometry dependent shader
     * @param {string} shader2 - the second part of the geometry dependent shader
     * @param {TeleportationSet} set - the underlying teleportation set
     * @param {DollyCamera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the Thurston part of the renderer
     * @param {WebGLRenderer|Object} threeRenderer - parameters for the underlying Three.js renderer
     */
    constructor(shader1, shader2, set, camera, scene, params = {}, threeRenderer = {}) {
        super(shader1, shader2, set, camera, scene, params, threeRenderer);
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

    get isPathTracerRenderer() {
        return true;
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
        const res = new Vector2(this.accWriteTarget.width, this.accWriteTarget.height);
        this._fragmentBuilder.addUniform('resolution', 'vec2', res)
        this._fragmentBuilder.addUniform('maxBounces', 'int', this.maxBounces);
        // geometry
        this._fragmentBuilder.addChunk(this.shader1);
        this._fragmentBuilder.addChunk(commons1);
        this._fragmentBuilder.addChunk(this.shader2);
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

    /**
     * Build the Three.js scene with the non-euclidean shader.
     * @return {PathTracerRenderer}
     */
    build() {
        // The lag that may occurs when we move the sphere to chase the camera can be the source of noisy movement.
        // We put a very large sphere around the user, to minimize this effect.
        const geometry = new SphereGeometry(1000, 60, 40);
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

    /**
     * Render the accumulated target
     * (for display or download purposes)
     */
    renderAccTarget() {
        this.threeRenderer.setRenderTarget(null);
        this.displayComposer.render();
    }

    render() {
        let accTmpTarget;
        this.updateFrameSeed();
        const res = new Vector2(this.accWriteTarget.width, this.accWriteTarget.height);
        this._fragmentBuilder.updateUniform('resolution', res);

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

        this.renderAccTarget();
        this.iFrame = this.iFrame + 1;
    }
}