import {Mesh, ShaderMaterial, PlaneGeometry, Vector2} from "three";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass.js";

import {AbstractRenderer} from "./AbstractRenderer.js";
import {ShaderBuilder} from "../../utils/ShaderBuilder.js";

import vertexShader from "./shaders/common/vertexFlatScreen.glsl";
import constants from "./shaders/common/constants.glsl";
import commons1 from "../geometry/shaders/commons1.glsl";
import commons2 from "../geometry/shaders/commons2.glsl";
import raymarch from "./shaders/basic/raymarch.glsl";
import scenes from "./shaders/basic/scenes.glsl.mustache";
import structVectorData from "./shaders/basic/vectorDataStruct.glsl";
import updateVectorData from "./shaders/basic/vectorDataUpdate.glsl.mustache";
import postProcessVoid from "./shaders/basic/postProcessVoid.glsl";
import postProcessGammaCorrection from "./shaders/basic/postProcessGammaCorrection.glsl";
import main from "./shaders/basic/main.glsl";


/**
 * @class
 *
 * @classdesc
 * Non-euclidean renderer.
 * Takes as input the non-euclidean camera and scene and makes some magic.
 * It should not be confused with the Three.js WebGLRenderer it relies on.
 *
 * This one is built with a flat Three.js screen.
 * It is provides an easier control on the projections between the tangent space and the screen.
 * It should be used with an orthographic Three.js camera
 */
export class FlatScreenRenderer extends AbstractRenderer {

    /**
     * Constructor.
     * @param {string} shader1 - the first part of the geometry dependent shader
     * @param {string} shader2 - the second part of the geometry dependent shader
     * @param {TeleportationSet} set - the underlying teleportation set
     * @param {Camera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the Thurston part of the renderer
     * @param {WebGLRenderer|Object} threeRenderer - parameters for the underlying Three.js renderer
     */
    constructor(shader1, shader2, set, camera, scene, params = {}, threeRenderer = {}) {
        super(shader1, shader2, set, camera, scene, params, threeRenderer);

        // Check if the three.js camera is compatible with the three.js screen used by the renderer.
        if(this.camera.threeCamera.type !== 'OrthographicCamera') {
            throw new Error('The underlying camera for this renderer should be of type "OrthographicCamera".');
        }

        /**
         * Builder for the fragment shader.
         * @type {ShaderBuilder}
         * @private
         */
        this._fragmentBuilder = new ShaderBuilder();
        /**
         * Effect composer for postprocessing
         * @type {EffectComposer}
         */
        this.composer = new EffectComposer(this.threeRenderer);

        this.postProcess = params.postProcess !== undefined ? params.postProcess : false;
        this.exposure = params.exposure !== undefined ? params.exposure : 1;


        this.globalUniforms.windowSize = {
            type: 'vec2',
            value: new Vector2(window.innerWidth, window.innerHeight)
        };
    }

    get isBasicRenderer() {
        return true;
    }

    setPixelRatio(value) {
        super.setPixelRatio(value);
        this.composer.setPixelRatio(window.devicePixelRatio);
    }

    setSize(width, height, updateStyle = true) {
        super.setSize(width, height, updateStyle);
        this.composer.setSize(width, height);
        this.globalUniforms.windowSize.value.set(width, height);
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
        if (this.postProcess) {
            this._fragmentBuilder.addUniform("exposure", "float", this.exposure);
            this._fragmentBuilder.addChunk(postProcessGammaCorrection);
        } else {
            this._fragmentBuilder.addChunk(postProcessVoid);
        }
        this._fragmentBuilder.addChunk(main);
    }

    /**
     * Build the Three.js scene with the non-euclidean shader.
     * @return {BasicRenderer}
     */
    build() {


        const geometry = new PlaneGeometry(2, 2);
        this.buildFragmentShader();
        const material = new ShaderMaterial({
            uniforms: this._fragmentBuilder.uniforms,
            vertexShader: vertexShader,
            fragmentShader: this._fragmentBuilder.code,
        });

        const threeScreen = new Mesh(geometry, material);
        this.threeScene.add(threeScreen);

        // add the render to the passes of the effect composer
        const renderPass = new RenderPass(this.threeScene, this.camera.threeCamera);
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