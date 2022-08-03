import {Mesh, ShaderMaterial, SphereBufferGeometry} from "three";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass.js";

import {AbstractRenderer} from "./AbstractRenderer.js";
import {ShaderBuilder} from "../../utils/ShaderBuilder.js";

import vertexShader from "./shaders/common/vertex.glsl";
import constants from "./shaders/common/constants.glsl";
import commons1 from "../geometry/shaders/commons1.glsl";
import commons2 from "../geometry/shaders/commons2.glsl";
import raymarch from "./shaders/common/raymarch.glsl";
import scenes from "./shaders/basic/scenes.glsl.mustache";
import structVectorData from "./shaders/basic/vectorDataStruct.glsl";
import updateVectorData from "./shaders/basic/vectorDataUpdate.glsl.mustache";
import SteveShader from "../../postProcess/steve/shader.js";
import main from "./shaders/basic/main.glsl";


/**
 * @class
 *
 * @classdesc
 * Non-euclidean renderer.
 * Takes as input the non-euclidean camera and scene and makes some magic.
 * It should not be confused with the Three.js WebGLRenderer it relies on.
 */
export class BasicRenderer extends AbstractRenderer {

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
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Build the fragment shader
     */
    buildFragmentShader() {

        // constants
        this._fragmentBuilder.addChunk(constants);
        this._fragmentBuilder.addUniform('maxBounces', 'int', this.maxBounces);
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
        this._fragmentBuilder.addChunk(scenes( this));
        this._fragmentBuilder.addChunk(updateVectorData(this));

        // ray-march and main
        this._fragmentBuilder.addChunk(raymarch);
        this._fragmentBuilder.addChunk(main);
    }

    /**
     * Build the Three.js scene with the non-euclidean shader.
     * @return {BasicRenderer}
     */
    build() {
        // The lag that may occurs when we move the sphere to chase the camera can be the source of noisy movement.
        // We put a very large sphere around the user, to minimize this effect.
        const geometry = new SphereBufferGeometry(1000, 60, 40);
        // sphere eversion !
        geometry.scale(1, 1, -1);

        this.buildFragmentShader();
        const material = new ShaderMaterial({
            uniforms: this._fragmentBuilder.uniforms,
            vertexShader: vertexShader,
            fragmentShader: this._fragmentBuilder.code,
        });
        const horizonSphere = new Mesh(geometry, material);
        this.threeScene.add(horizonSphere);

        // add the render to the passes of the effect composer
        const renderPass = new RenderPass(this.threeScene, this.camera.threeCamera);
        renderPass.clear = false;
        this.composer.addPass(renderPass);

        if (this.postProcess) {
            const effectPass = new ShaderPass(SteveShader);
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