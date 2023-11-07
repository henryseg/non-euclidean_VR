import {SphereCamera} from "../sphereCamera/SphereCamera.js";
import struct from "./shaders/struct.glsl";
import mapping from "./shaders/mapping.glsl";

export class PathTracerCamera extends SphereCamera {

    /**
     *
     * @param parameters
     */
    constructor(parameters) {
        super(parameters);
        /**
         * Focal length
         * @type {number}
         */
        this.focalLength = parameters.focalLength !== undefined ? parameters.focalLength : 1;
        /**
         * Aperture
         * @type {number}
         */
        this.aperture = parameters.aperture !== undefined ? parameters.aperture : 0;
    }

    static glslClass() {
        return struct;
    }

    static glslMapping() {
        return mapping;
    }
}