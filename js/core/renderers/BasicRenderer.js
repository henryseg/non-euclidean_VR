import {mustache} from "../../lib/mustache.mjs";
import {Mesh, ShaderMaterial, SphereBufferGeometry} from "../../lib/threejs/build/three.module.js";
import {EffectComposer} from "../../lib/threejs/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "../../lib/threejs/examples/jsm/postprocessing/RenderPass.js";
import {ShaderPass} from "../../lib/threejs/examples/jsm/postprocessing/ShaderPass.js";

import {AbstractRenderer} from "./AbstractRenderer.js";
import {ShaderBuilder} from "../../utils/ShaderBuilder.js";

import vertexShader from "./shaders/common/vertex.js";
import constants from "./shaders/common/constants.js";
import commons1 from "../geometry/shaders/commons1.js";
import commons2 from "../geometry/shaders/commons2.js";
import raymarch from "./shaders/common/raymarch.js";
import scenes from "./shaders/common/scenes.js";
import structVectorData from "./shaders/basic/vectorDataStruct.js";
import updateVectorData from "./shaders/basic/vectorDataUpdate.js";
import SteveShader from "../../postProcess/steve/shader.js";
import main from "./shaders/basic/main.js";


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
     * @param {Object} geom - the underlying geometry
     * @param {TeleportationSet} set - the underlying teleportation set
     * @param {BasicCamera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the Thurston part of the renderer
     * @param {WebGLRenderer|Object} threeRenderer - parameters for the underlying Three.js renderer
     */
    constructor(geom, set, camera, scene, params = {}, threeRenderer = {}) {
        super(geom, set, camera, scene, params, threeRenderer);
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
        this._fragmentBuilder.addChunk(this.geom.shader1);
        this._fragmentBuilder.addChunk(commons1);
        this._fragmentBuilder.addChunk(this.geom.shader2);
        this._fragmentBuilder.addChunk(commons2);

        // data carried by ExtVector
        this._fragmentBuilder.addChunk(structVectorData);
        // subgroup/quotient orbifold
        this.set.shader(this._fragmentBuilder);

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