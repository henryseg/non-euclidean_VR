/**
 * @module Thurston Euclidean items
 *
 * @description
 * Add to the Thurston module a library of euclidean items (objects, lights, etc)
 */

import {
    Isometry,
    Point,
    Position
} from '../geometry/abstract.js'

import {
    Item,
    Solid,
    Light
} from './abstract.js'

class Ball extends Solid {

    constructor(center, radius, material) {
        const position = new Position();
        position.setBoost(new Isometry().makeTranslation(center));
        const data = {
            position: position,
            material: material,
        }
        super(data);
        this.center = center;
        this.radius = radius;
    }

    get shaderSource(){
        return 'shaders/items/euc/items.xml';
    }

    default() {
        const res = super.default();
        return Object.assign(res, {center: new Point(), radius: 0.2});
    }
}

class PointLight extends Light {

    constructor(location, color) {
        const position = new Position();
        position.setBoost(new Isometry().makeTranslation(location));
        const data = {
            position: position,
            color: color,
        }
        super(data);
    }

    get shaderSource(){
        return 'shaders/items/euc/items.xml';
    }

        /*
    default() {
        const res = super.default();
        return Object.assign(res, {location: new Point()});
    }*/
}

export {
    Ball,
    PointLight
}
