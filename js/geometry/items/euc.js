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

import {
  Thurston
} from '../thurston.js'


/**
* @const {Object}
* @default The default values of the Item properties
*/
const ballDefault = {
  center: new Point(),
  radius: 0.1
}

class Ball extends Object {

  constructor(data) {
    buildFromModel(this, ballDefault, data);
    const position = new Position();
    position.setBoost(this.center.makeTranslation());
    const extendedData = Object.assign({},data, {position: position});
    super(extendedData);
  }
}
