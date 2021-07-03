import * as WebXRPolyfill from "webxr-polyfill";
import {Mesh, ShaderMaterial, SphereBufferGeometry} from "three";
import {VRButton as VRButtonLib} from "three/examples/jsm/webxr/VRButton.js";

import {bind} from "../../utils.js";
import {ShaderBuilder} from "../../utils/ShaderBuilder.js";
import {AbstractRenderer} from "./AbstractRenderer.js";
import {LEFT, RIGHT} from "../../constants.js";

import vertexShader from "./shaders/common/vertex.glsl";
import constants from "./shaders/common/constants.glsl";
import commons1 from "../geometry/shaders/commons1.glsl";
import commons2 from "../geometry/shaders/commons2.glsl";
import raymarch from "./shaders/common/raymarch.glsl";
import scenes from "./shaders/basic/scenes.glsl.mustache";
import structVectorData from "./shaders/basic/vectorDataStruct.glsl";
import updateVectorData from "./shaders/basic/vectorDataUpdate.glsl.mustache";
import main from "./shaders/basic/main.glsl";


/**
 * @class
 *
 * @classdesc
 * Renderer for virtual reality.
 * Based on the tools provided by Three.js (which relies on WebXR).
 * We place in distinct layer of the Three.js scene two horizon spheres.
 * Each sphere will render the picture seen by one eye.
 *
 * @todo Check the impact of the pixel ratio (for the three.js camera)
 */
export class VRRenderer extends AbstractRenderer {

    /**
     * Constructor.
     * @param {string} shader1 - the first part of the geometry dependent shader
     * @param {string} shader2 - the second part of the geometry dependent shader
     * @param {TeleportationSet} set - the underlying teleportation set
     * @param {VRCamera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the underlying Three.js renderer
     * @param {WebGLRenderer|Object} threeRenderer - parameters for the underlying Three.js renderer
     */
    constructor(shader1, shader2, set, camera, scene, params = {}, threeRenderer = {}) {
        // loading the polyfill if WebXR is not supported
        new WebXRPolyfill.default();
        super(shader1, shader2, set, camera, scene, params, threeRenderer);

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

    get isVRRenderer() {
        return true;
    }

    /**
     * Shortcut to access the Three.js WebXRManager
     * @return {WebXRManager}
     */
    get xr() {
        return this.threeRenderer.xr;
    }

    buildFragmentShader() {
        for (const side of [LEFT, RIGHT]) {
            // constants
            this._fragmentBuilder[side].addChunk(constants);
            this._fragmentBuilder[side].addUniform('maxBounces', 'int', this.maxBounces);
            // geometry
            this._fragmentBuilder[side].addChunk(this.shader1);
            this._fragmentBuilder[side].addChunk(commons1);
            this._fragmentBuilder[side].addChunk(this.shader2);
            this._fragmentBuilder[side].addChunk(commons2);

            // data carried with RelVector
            this._fragmentBuilder[side].addChunk(structVectorData);
            // subgroup/quotient orbifold
            this.set.shader(this._fragmentBuilder[side]);

            // camera
            this.camera.sidedShader(this._fragmentBuilder[side], side);

            // scene
            this.scene.shader(this._fragmentBuilder[side]);
            this._fragmentBuilder[side].addChunk(scenes(this));
            this._fragmentBuilder[side].addChunk(updateVectorData(this));


            // ray-march and main
            this._fragmentBuilder[side].addChunk(raymarch);
            this._fragmentBuilder[side].addChunk(main);
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

    checkShader(side = LEFT) {
        console.log(this._fragmentBuilder[side].code);
    }

    render() {
        this.camera.chaseThreeCamera(this.threeRenderer.xr);
        this.threeRenderer.render(this.threeScene, this.camera.threeCamera);
    }
}