import {Position} from "../../geometry/abstract/Position.js";
import {Isometry} from "../../geometry/abstract/Isometry.js";
import {Solid} from "../abstract/Solid.js";

class BallComplement extends Solid {

    constructor(direction, radius, material, global = true) {
        const position = new Position();
        position.setBoost(new Isometry().makeTranslationFromDir(direction));
        const data = {
            position: position,
            material: material,
            global: global
        }
        super(data);
        this.direction = direction;
        this.radius = radius;
    }

    get shaderSource() {
        return '/shaders/objects/sph/items.xml';
    }
}

export {
    BallComplement
}