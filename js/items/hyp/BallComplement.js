import {
    Position
} from "../../geometry/abstract/Position.js";
import {
    Isometry
} from "../../geometry/abstract/Isometry.js";
import {
    Solid
} from "../abstract/Solid.js";

class BallComplement extends Solid {

    constructor(center, radius, material, global = true) {
        const position = new Position();
        position.setBoost(new Isometry().makeTranslationFromDir(center));
        const data = {
            position: position,
            material: material,
            global: global
        }
        super(data);
        this.center = center;
        this.radius = radius;
    }

    get shaderSource() {
        return 'shaders/items/hyp/items.xml';
    }
}

export {
    BallComplement
}
