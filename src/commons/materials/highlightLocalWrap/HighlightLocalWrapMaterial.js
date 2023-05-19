import {Material} from "../../../core/materials/Material.js";

import struct from "./shaders/struct.glsl";
import render from "./shaders/render.glsl.mustache";
import renderNormal from "./shaders/renderNormal.glsl.mustache";
import renderUV from "./shaders/renderUV.glsl.mustache";
import renderNormalUV from "./shaders/renderNormalUV.glsl.mustache";


/**
 * @class
 *
 * @classdesc
 * Combination of two materials, to highlight an object in a simulation
 * The highlighted object is a single "copy" of a local object (characterized by its cellBoost)
 */
export class HighlightLocalWrapMaterial extends Material {

    /**
     * Constructor.
     * @param {Material} defaultMat - the default material
     * @param {Material} highlightMat - the highlight material
     * @param {GroupElement} cellBoost - isometry, in case we only highlight a single copy of a local object
     */
    constructor(defaultMat, highlightMat, cellBoost) {
        super();
        this.defaultMat = defaultMat;
        this.highlightMat = highlightMat;
        this.cellBoost = cellBoost;
    }

    get uniformType() {
        return 'HighlightLocalWrapMaterial';
    }

    static glslClass() {
        return struct;
    }

    get usesNormal() {
        return true;
    }

    get usesUVMap() {
        return (this.defaultMat.usesUVMap || this.highlightMat.usesUVMap);
    }

    get usesLight() {
        return (this.defaultMat.usesLight || this.highlightMat.usesLight);
    }

    get isReflecting() {
        return (this.defaultMat.isReflecting || this.highlightMat.isReflecting);
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
        this.defaultMat.setId(scene);
        this.highlightMat.setId(scene);
        super.setId(scene);
    }

    /**
     * Additional actions to perform when the material is added to the scene.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    onAdd(scene) {
        this.defaultMat.onAdd(scene);
        this.highlightMat.onAdd(scene);
        super.onAdd(scene);
    }

    shader(shaderBuilder) {
        this.defaultMat.shader(shaderBuilder);
        this.highlightMat.shader(shaderBuilder);
        super.shader(shaderBuilder);
    }
}

/**
 * Wrap the material into another material handling the Phong model
 * @param {Material} defaultMat - the default material
 * @param {Material} highlightMat - the highlight material
 * @param {GroupElement} cellBoost - isometry, in case we only highlight a single copy of a local object
 */
export function highlightLocalWrap(defaultMat, highlightMat, cellBoost) {
    return new HighlightLocalWrapMaterial(defaultMat, highlightMat, cellBoost);
}