import {PostProcess} from "../../../core/renderers/PostProcess.js";

import fragment from "./shaders/fragment.glsl";

export class AcesFilmPostProcess extends PostProcess {

    /**
     * Constructor
     * @param {number} exposure - the exposure
     */
    constructor(exposure) {
        super();
        this.exposure = exposure !== undefined ? exposure : 0.8;
    }

    uniforms() {
        const res = super.uniforms();
        res.exposure = {value: this.exposure}
        return res;
    }

    fragmentShader() {
        return fragment;
    }
}