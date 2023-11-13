import {VRButton as VRButtonLib} from "three/addons";

import {bind} from "../utils.js";
import {ShaderBuilder} from "../../utils/ShaderBuilder.js";
import {Renderer} from "./Renderer.js";
import {LEFT, RIGHT} from "../constants.js";
import {VRCamera} from "../cameras/vrCamera/VRCamera.js";

import constants from "./shaders/common/constants.glsl";
import commons1 from "../geometry/shaders/commons1.glsl";
import commons2 from "../geometry/shaders/commons2.glsl";
import raymarch from "./shaders/basic/raymarch.glsl";
import scenes from "./shaders/basic/scenes.glsl.mustache";
import structVectorData from "./shaders/basic/vectorDataStruct.glsl";
import updateVectorData from "./shaders/basic/vectorDataUpdate.glsl.mustache";
import postProcessVoid from "./shaders/basic/postProcessVoid.glsl";
import postProcessGammaCorrection from "./shaders/vr/postProcessGammaCorrection.glsl";
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
export class VRRenderer extends Renderer {

    /**
     * Constructor.
     * @param {VRCamera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the underlying Three.js renderer
     * @param {WebGLRenderer|Object} threeRenderer - parameters for the underlying Three.js renderer
     */
    constructor(camera, scene, params = {}, threeRenderer = {}) {
        super(camera, scene, params, threeRenderer);

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
        this._fragmentBuilders = [new ShaderBuilder(), new ShaderBuilder()];

        this.postProcess = params.postProcess !== undefined ? params.postProcess : false;
        this.exposure = params.exposure !== undefined ? params.exposure : 1;
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
            this._fragmentBuilders[side].addChunk(constants);
            Object.keys(this.globalUniforms).forEach(name => {
                const type = this.globalUniforms[name].type;
                const value = this.globalUniforms[name].value;
                this._fragmentBuilders[side].addUniform(name, type, value);
            });

            // geometry
            this._fragmentBuilders[side].addChunk(this.constructor.shader1);
            this._fragmentBuilders[side].addChunk(commons1);
            this._fragmentBuilders[side].addChunk(this.constructor.shader2);
            this._fragmentBuilders[side].addChunk(commons2);

            // data carried with RelVector
            this._fragmentBuilders[side].addChunk(structVectorData);
            // subgroup/quotient orbifold
            this.set.shader(this._fragmentBuilders[side]);

            // camera
            this.camera.shader(this._fragmentBuilders[side], side);

            // scene
            this.scene.shader(this._fragmentBuilders[side]);
            this._fragmentBuilders[side].addChunk(scenes(this));
            this._fragmentBuilders[side].addChunk(updateVectorData(this));


            // ray-march and main
            this._fragmentBuilders[side].addChunk(raymarch);
            if(this.postProcess){
                this._fragmentBuilders[side].addUniform("exposure", "float", this.exposure);
                this._fragmentBuilders[side].addChunk(postProcessGammaCorrection);
            }
            else{
                this._fragmentBuilders[side].addChunk(postProcessVoid);
            }
            this._fragmentBuilders[side].addChunk(main);
        }
    }

    build() {
        this.buildFragmentShader();
        this.camera.setThreeScene(this._fragmentBuilders);
    }

    checkShader(side = LEFT) {
        console.log(this._fragmentBuilders[side].code);
    }

    render() {
        this.camera.chaseThreeCamera();
        this.threeRenderer.render(this.camera.threeScene, this.camera.threeCamera);
    }
}