import {mustache} from "../../lib/mustache.mjs";

import {AbstractRenderer} from "./AbstractRenderer.js";
import {ShaderBuilder} from "../../utils/ShaderBuilder.js";
import {Mesh, ShaderMaterial, SphereBufferGeometry} from "../../lib/threejs/build/three.module.js";


import vertexShader from "./shaders/vertex.js";
import constants from "./shaders/constants.js";
import commons1 from "../geometry/shaders/commons1.js";
import commons2 from "../geometry/shaders/commons2.js";
import scenes from "./shaders/scenes.js";
import raymarch from "./shaders/raymarch.js";
import random from "./shaders/random.js";
import structVectorData from "./shaders/PTVectorData/struct.js";
import updateVectorData from "./shaders/PTVectorData/update.js";

export class PathTracerRenderer extends AbstractRenderer {

    /**
     * Constructor.
     * @param {Object} geom - the underlying geometry
     * @param {TeleportationSet} set - the underlying teleportation set
     * @param {BasicCamera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} threeJSParams - parameters for the underlying Three.js renderer
     * @param {Object} thurstonParams - parameters for the Thurston part of the renderer
     */
    constructor(geom, set, camera, scene, threeJSParams = {}, thurstonParams = {}) {
        super(geom, set, camera, scene, threeJSParams, thurstonParams);
        /**
         * Builder for the fragment shader.
         * @type {ShaderBuilder}
         * @private
         */
        this._fragmentBuilder = new ShaderBuilder();
    }

    /**
     * Build the fragment shader
     */
    buildFragmentShader() {
        // constants
        this._fragmentBuilder.addChunk(constants);
        // geometry
        this._fragmentBuilder.addChunk(this.geom.shader1);
        this._fragmentBuilder.addChunk(commons1);
        this._fragmentBuilder.addChunk(this.geom.shader2);
        this._fragmentBuilder.addChunk(commons2);

        this._fragmentBuilder.addChunk(random);
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
    }

    /**
     * Build the Three.js scene with the non-euclidean shader.
     * @return {PathTracerRenderer}
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

        return this;
    }

    checkShader() {
        console.log(this._fragmentBuilder.code);
    }

    render() {
        this.threeRenderer.render(this.threeScene, this.camera.threeCamera);
    }


}