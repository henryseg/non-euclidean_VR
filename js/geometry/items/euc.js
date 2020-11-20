/**
 * @module Thruston Euclidean items
 *
 * @description
 * Add to the Thurston module a library of euclidean items (objects, lights, etc)
 */

 import {
   buildFromModel
 } from '../../toolbox.js'

 import {
   Isometry,
   Point,
   Position
 } from '../foundations/abstract.js'

import {
  Item,
  Solid,
  Light
} from './abstract.js'

class Ball extends Solid {

  constructor(data={}) {
    super(data);
    let isom = new Isometry().makeTranslation(this.center);
    this.position.setBoost(isom);
  }

  toBuild() {
    const res = super.toBuild();
    res.push('center', 'radius');
    return res;
  }

  set center(center){
    if(center == undefined){
      this._center = new Point();
    }
    else {
      this._center = center;
    }
  }

  get center(){
    return this._center;
  }

  set radius(radius){
    if(radius == undefined){
      this._radius = 0.2;
    }
    else {
      this._radius = radius;
    }
  }

  get radius(){
    return this._radius;
  }
}

class PointLight extends Light {

  constructor(data={}) {
    super(data);
    let isom = new Isometry().makeTranslation(this.location);
    this.position.setBoost(isom);
  }

  toBuild() {
    const res = super.toBuild();
    res.push('location');
    return res;
  }

  set location(location){
    if(location == undefined){
      this._location = new Point();
    }
    else {
      this._location = location;
    }
  }

  get location(){
    return this._location;
  }
}

export {
  Ball,
  PointLight
}
