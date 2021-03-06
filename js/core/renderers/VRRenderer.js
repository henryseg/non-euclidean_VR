import * as WebXRPolyfill from "../../lib/webxr-polyfill.module.js";
import {VRButton as VRButtonLib} from "../../lib/VRButton.js";

import {bind} from "../../utils.js";

import {ShaderBuilder} from "../../utils/ShaderBuilder.js";
import {Renderer} from "./Renderer.js";

import {LEFT, RIGHT} from "../../constants.js";

import vertexShader from "./shaders/vertex.js";
import {Mesh, ShaderMaterial, SphereBufferGeometry} from "../../lib/three.module.js";
import constants from "./shaders/constants.js";
import commons1 from "../geometry/shaders/commons1.js";
import commons2 from "../geometry/shaders/commons2.js";
import raymarch from "./shaders/raymarch.js";
import {mustache} from "../../lib/mustache.mjs";
import scenes from "./shaders/scenes.js";


/**
 * @class
 *
 * @classdesc
 * Renderer for virtual reality.
 * Based on the tools provided by Three.js (which relies on WebXR).
 * We place in distinct layer of the Three.js scene two horizon spheres.
 * Each sphere will render the picture seen by one eye.
 */
export class VRRenderer extends Renderer {

    /**
     * Constructor.
     * @param {Object} geom - the underlying geometry
     * @param {TeleportationSet} set - the underlying teleportation set
     * @param {VRCamera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the underlying Three.js renderer
     */
    constructor(geom, set, camera, scene, params = {}) {
        // loading the polyfill if WebXR is not supported
        new WebXRPolyfill.default();
        super(geom, set, camera, scene, params);

        this.threeRenderer.xr.enabled = true;
        this.threeRenderer.xr.setReferenceSpaceType('local');
        this.camera.threeCamera.layers.enable(1);

        const VRButton = VRButtonLib.createButton(this.threeRenderer);
        const _onClickVRButton = bind(this.camera, this.camera.switchStereo);
        VRButton.addEventListener('click', _onClickVRButton, false);
        document.body.appendChild(VRButton);

        /**
         * Builder for the fragment shader.
         * The first one correspond to the left eye, the second one to the right eye
         * @type {ShaderBuilder[]}
         * @private
         */
        this._fragmentBuilder = [new ShaderBuilder(), new ShaderBuilder()];
    }

    /**
     * Shortcut to access the Three.js WebXRManager
     * @return {WebXRManager}
     */
    get xr(){
        return this.threeRenderer.xr;
    }

    buildFragmentShader() {
        for (const side of [LEFT, RIGHT]) {
            // constants
            this._fragmentBuilder[side].addChunk(constants);
            // geometry
            this._fragmentBuilder[side].addChunk(this.geom.shader1);
            this._fragmentBuilder[side].addChunk(commons1);
            this._fragmentBuilder[side].addChunk(this.geom.shader2);
            this._fragmentBuilder[side].addChunk(commons2);

            // subgroup/quotient orbifold
            this.set.shader(this._fragmentBuilder[side]);

            // camera
            this.camera.sidedShader(this._fragmentBuilder[side], side);

            // scene
            this.scene.shader(this._fragmentBuilder[side]);
            this._fragmentBuilder[side].addChunk(mustache.render(scenes, this));


            // ray-march and main
            this._fragmentBuilder[side].addChunk(raymarch);
        }
    }

    build() {
        // The lag that may occurs when we move the sphere to chase the camera can be the source of noisy movement.
        // We put a very large sphere around the user, to minimize this effect.
        const geometry = new SphereBufferGeometry(1000, 60, 40);
        // sphere eversion !
        geometry.scale(1, 1, -1);

        this.buildFragmentShader();
        const leftMaterial = new ShaderMaterial({
            uniforms: this._fragmentBuilder[LEFT].uniforms,
            vertexShader: vertexShader,
            fragmentShader: this._fragmentBuilder[LEFT].code,
        });
        const rightMaterial = new ShaderMaterial({
            uniforms: this._fragmentBuilder[RIGHT].uniforms,
            vertexShader: vertexShader,
            fragmentShader: this._fragmentBuilder[RIGHT].code,
        });
        const leftHorizonSphere = new Mesh(geometry, leftMaterial);
        const rightHorizonSphere = new Mesh(geometry, rightMaterial);
        leftHorizonSphere.layers.set(1);
        rightHorizonSphere.layers.set(2);
        this.threeScene.add(leftHorizonSphere, rightHorizonSphere);
    }

    checkShader(side=LEFT) {
        console.log(this._fragmentBuilder[side].code);
    }

    render(){
        this.camera.chaseThreeCamera(this.threeRenderer.xr);
        super.render();
    }
}