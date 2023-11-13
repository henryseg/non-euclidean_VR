import {Mesh, OrthographicCamera, PlaneGeometry, ShaderMaterial} from "three";

import {Camera} from "../camera/Camera.js";
import vertexShader from "./shaders/vertex.glsl";
import struct from "./shaders/struct.glsl";
import mapping from "./shaders/mapping.glsl";


/**
 *
 * @classdesc
 * Camera with a rectangle as a Three.js screen
 */
export class FlatCamera extends Camera {


    constructor(parameters) {
        super(parameters);

        /**
         * Vertical field of view (in degrees)
         * Default value is the same as in three.js
         * @type {number}
         */
        this.fov = parameters.fov !== undefined ? parameters.fov : 50;
    }

    /**
     * Set up an Orthographic Three.js camera.
     */
    setThreeCamera() {
        this.threeCamera = new OrthographicCamera(
            -1,
            1,
            1,
            -1,
            0,
            1
        );
        this.threeCamera.position.set(0, 0, 0);
        this.threeCamera.lookAt(0, 0, -1);
    }

    /**
     * Vertical field of view in radians
     * @return {number}
     */
    get fovRadians() {
        return Math.PI * this.fov / 180;
    }


    /**
     * Set up the Three.js scene compatible with the Three.js camera
     */
    setThreeScene(shaderBuilder) {
        const geometry = new PlaneGeometry(2, 2);
        const material = new ShaderMaterial({
            uniforms: shaderBuilder.uniforms,
            vertexShader: vertexShader,
            fragmentShader: shaderBuilder.fragmentShader,
        });

        const threeScreen = new Mesh(geometry, material);
        this.threeScene.add(threeScreen);
    }

    static glslClass() {
        return struct;
    }

    static glslMapping() {
        return mapping;
    }

}