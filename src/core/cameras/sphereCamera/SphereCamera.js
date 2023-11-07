import {Mesh, PerspectiveCamera, ShaderMaterial, SphereGeometry} from "three";

import {Camera} from "../camera/Camera.js";
import vertexShader from "./shaders/vertex.glsl";
import struct from "./shaders/struct.glsl";
import mapping from "./shaders/mapping.glsl";


/**
 *
 * @classdesc
 * Camera with a sphere as a Three.js screen
 */
export class SphereCamera extends Camera {


    constructor(parameters) {
        super(parameters);
    }

    /**
     * Set up a Perspective Three.js Camera
     */
    setThreeCamera(parameters) {
        this.threeCamera = new PerspectiveCamera(
            parameters.fov !== undefined ? parameters.fov : 70,
            window.innerWidth / window.innerHeight,
            0.01,
            2000
        );
        this.threeCamera.position.set(0, 0, 0);
        this.threeCamera.lookAt(0, 0, -1);
    }

    /**
     * Shortcut to reset the aspect of the underlying Three.js camera
     * @param {number} value
     */
    set aspect(value) {
        this.threeCamera.aspect = value;
    }

    /**
     * Vertical field of view (in degree) from bottom to top.
     * @return {number}
     */
    get fov() {
        return this.threeCamera.fov
    }

    set fov(value) {
        this.threeCamera.fov = value;
    }

    /**
     * Vertical field of view in radians
     * @return {number}
     */
    get fovRadians() {
        return Math.PI * this.fov / 180;
    }

    /**
     *
     * Set up the Three.js scene compatible with the Three.js camera
     *
     * The lag that may occur when we move the sphere to chase the camera can be the source of noisy movement.
     * We put a very large sphere around the user, to minimize this effect.
     */
    setThreeScene(shaderBuilder) {
        const geometry = new SphereGeometry(1000, 60, 40);
        // sphere eversion !
        geometry.scale(1, 1, -1);

        this.buildFragmentShader();
        const material = new ShaderMaterial({
            uniforms: shaderBuilder.uniforms,
            vertexShader: vertexShader,
            fragmentShader: shaderBuilder.fragmentShader,
        });
        const horizonSphere = new Mesh(geometry, material);
        this.threeScene.add(horizonSphere);
    }

    static glslClass() {
        return struct;
    }

    static glslMapping() {
        return mapping;
    }

}