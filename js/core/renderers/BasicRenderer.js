import {Mesh, ShaderMaterial, SphereBufferGeometry} from "../../lib/three.module.js";

import {Renderer} from "./Renderer.js";
import {ShaderBuilder} from "../ShaderBuilder.js";

import vertexShader from "./shaders/vertex.js";
import constants from "./shaders/constants.js";
import commons1 from "../geometry/shaders/commons1.js";
import commons2 from "../geometry/shaders/commons2.js";
import raymarch from "./shaders/raymarch.js";


/**
 * @class
 *
 * @classdesc
 * Non-euclidean renderer.
 * Takes as input the non-euclidean camera and scene and makes some magic.
 * It should not be confused with the Three.js WebGLRenderer it relies on.
 */
export class BasicRenderer extends Renderer {

    /**
     * Constructor.
     * @param {Object} geom - the underlying geometry
     * @param {Subgroup} subgroup - the underlying subgroup
     * @param {BasicCamera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the underlying Three.js renderer
     */
    constructor(geom, subgroup, camera, scene, params = {}) {
        super(geom, subgroup, camera, scene, params);
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

        // subgroup/quotient orbifold
        this.subgroup.shader(this._fragmentBuilder);

        // camera
        this.camera.shader(this._fragmentBuilder)

        // scene
        this.scene.shader(this._fragmentBuilder);

        // ray-march and main
        this._fragmentBuilder.addChunk(raymarch);
    }

    /**
     * Build the Three.js scene with the non-euclidean shader.
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


}