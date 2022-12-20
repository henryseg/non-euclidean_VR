import {PostProcess} from "../../../core/renderers/PostProcess.js";

import fragment from "./shaders/fragment.glsl";

export class LinearToSRGBPostProcess extends PostProcess {

    /**
     * Constructor
     */
    constructor() {
        super();
    }

    fragmentShader() {
        return fragment;
    }
}