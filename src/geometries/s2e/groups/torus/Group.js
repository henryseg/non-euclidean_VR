import {Vector4} from "three";

import {Group as AbstractGroup} from "../../../../core/groups/Group.js";
import {GroupElement} from "./GroupElement.js";
import struct from "./shaders/struct.glsl";
import element from "./shaders/element.glsl";

export class Group extends AbstractGroup {

    /**
     * Constructor.
     * Group Z/n x Z, where
     * - Z/n is a rotation group in the sphere (around the x-axis)
     * - Z is a translation group along the fiber by a length 2 pi / n
     * @param {number} n - the order of the cyclic factor
     */
    constructor(n = undefined) {
        super();
        this.n = n !== undefined ? n : 4;
    }

    get halfHeight() {
        return Math.PI / this.n;
    }

    get angle() {
        return 2 * Math.PI / this.n;
    }

    get normalP() {
        return new Vector4(
            0,
            -Math.cos(0.5 * this.angle),
            -Math.sin(0.5 * this.angle),
            0
        );
    }

    get normalN() {
        return new Vector4(
            0,
            Math.cos(0.5 * this.angle),
            -Math.sin(0.5 * this.angle),
            0
        );
    }

    element() {
        return new GroupElement(this, ...arguments);
    }

    shader(shaderBuilder) {
        shaderBuilder.addChunk(struct);
        shaderBuilder.addUniform('group', 'Group', this);
        shaderBuilder.addChunk(element);
    }
}