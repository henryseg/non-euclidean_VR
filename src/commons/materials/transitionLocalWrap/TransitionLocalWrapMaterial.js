import {Clock} from "three";

import {Material} from "../../../core/materials/Material.js";
import {clamp} from "../../../utils.js"

import struct from "./shaders/struct.glsl";
import render from "./shaders/render.glsl.mustache";
import renderNormal from "./shaders/renderNormal.glsl.mustache";
import renderUV from "./shaders/renderUV.glsl.mustache";
import renderNormalUV from "./shaders/renderNormalUV.glsl.mustache";


/**
 * @class
 *
 * @classdesc
 * Combination of two materials.
 * Can smoothly interpolate between two materials
 * Only a single "copy" of a local object is affected (characterized by its cellBoost)
 */
export class TransitionLocalWrapMaterial extends Material {

    /**
     * Constructor.
     * @param {Material} mat0 - the first material (ratio 0)
     * @param {Material} mat1 - the second material (ratio 1)
     * @param {GroupElement} cellBoost - isometry, in case we only highlight a single copy of a local object
     * @param {number} duration - duration of the transition (in s)
     */
    constructor(mat0, mat1, cellBoost, duration = undefined) {
        super();
        this.mat0 = mat0;
        this.mat1 = mat1;
        this.duration = duration !== undefined ? duration : 5;
        this.cellBoost = cellBoost;

        this._clock = new Clock();
        this._ratio = 0;
        this._ratioOrigin = 0;
        this._direction = -1;
    }

    toggle() {
        this._direction = -this._direction;
        this._ratioOrigin = this._ratio;
        this._clock.start();
    }

    get ratio() {
        this._ratio = clamp(
            this._ratioOrigin + this._direction * (this._clock.getElapsedTime() / this.duration),
            0,
            1
        );
        return this._ratio;
    }

    get uniformType() {
        return 'TransitionLocalWrapMaterial';
    }

    static glslClass() {
        return struct;
    }

    get usesNormal() {
        return true;
    }

    get usesUVMap() {
        return (this.mat0.usesUVMap || this.mat1.usesUVMap);
    }

    get usesLight() {
        return (this.mat0.usesLight || this.mat1.usesLight);
    }

    get isReflecting() {
        return (this.mat0.isReflecting || this.mat1.isReflecting);
    }

    glslRender() {
        if (this.usesNormal) {
            if (this.usesUVMap) {
                return renderNormalUV(this);
            } else {
                return renderNormal(this);
            }
        } else {
            if (this.usesUVMap) {
                return renderUV(this);
            } else {
                return render(this);
            }
        }
    }

    /**
     * Set the ID of the material.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    setId(scene) {
        this.mat0.setId(scene);
        this.mat1.setId(scene);
        super.setId(scene);
    }

    /**
     * Additional actions to perform when the material is added to the scene.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    onAdd(scene) {
        this.mat0.onAdd(scene);
        this.mat1.onAdd(scene);
        super.onAdd(scene);
    }

    shader(shaderBuilder) {
        this.mat0.shader(shaderBuilder);
        this.mat1.shader(shaderBuilder);
        super.shader(shaderBuilder);
    }
}

/**
 * Wrap the material into another material handling the Phong model
 * @param {Material} defaultMat - the default material
 * @param {Material} highlightMat - the highlight material
 * @param {GroupElement} cellBoost - isometry, in case we only highlight a single copy of a local object
 * @param {number} duration - duration of the transition (in ms)
 */
export function transitionLocalWrap(defaultMat, highlightMat, cellBoost, duration) {
    return new TransitionLocalWrapMaterial(defaultMat, highlightMat, cellBoost, duration);
}