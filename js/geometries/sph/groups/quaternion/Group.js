import {Group as AbstractGroup} from "../../../../core/groups/Group.js";
import element from "./shaders/element.js";
import {GroupElement} from "./GroupElement.js";

/**
 * @class
 *
 * @classdesc
 * Group of unit quaternion with integer coordinates.
 */
export class Group extends AbstractGroup {

    constructor() {
        super();
    }

    element() {
        let x = 0, y = 0, z = 0, w = 1;
        if (arguments.length === 4) {
            [x, y, z, w] = arguments;
        }
        return new GroupElement(this, x, y, z, w)
    }

    shader(shaderBuilder) {
        shaderBuilder.addChunk(element);
    }
}