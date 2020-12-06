/**
 * @module ThurstonEuclideanItems
 *
 * @description
 * Add to the Thurston module a library of euclidean items (objects, lights, etc)
 */

import {
    Isometry,
    Position
} from "../geometry/euc.js";

import {
    Solid,
    Light
} from "./abstract.js";

class Ball extends Solid {

    constructor(center, radius, material, global = true) {
        const position = new Position();
        position.setBoost(new Isometry().makeTranslation(center));
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
        return 'shaders/items/euc/items.xml';
    }
}


class BallComplement extends Solid {

    constructor(center, radius, material, global = true) {
        const position = new Position();
        position.setBoost(new Isometry().makeTranslation(center));
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
        return 'shaders/items/euc/items.xml';
    }
}

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
        return 'shaders/items/euc/items.xml';
    }
}

export {
    Ball,
    BallComplement,
    PointLight
}
