import {Position} from "../../geometry/abstract/Position.js";
import {Isometry} from "../../geometry/abstract/Isometry.js";
import {Light} from "../abstract/Light.js";

class PointLight extends Light {

    constructor(location, color, global = true) {
        const position = new Position();
        position.setBoost(new Isometry().makeTranslation(location));
        const data = {
            position: position,
            color: color,
            global: global
        }
        super(data);
    }

    get shaderSource() {
        return '/shaders/items/sph/items.xml';
    }
}

export {
    PointLight
}