/**
* @module Thurston Items
*
* @description
* Add to the Thurston module a library of items (objects, lights, etc)
*/

import {
  buildFromModel
} from '../../toolbox.js'

import {
  Vector3
} from '../../lib/three.module.js'

import{
  Position
} from '../foundations/abstract.js'

import {
  Material
} from '../../material.js'




/**
* @class
*
* @classdesc
* Generic class for items in the scene (solids, lights, etc)
* This class should never be instantiated directly.
*
* @property {number} id - an ID (to be set when the object is added to the scene)
* @property {boolean} _global  - private storing of `global`
* @property {Position} _position - private storing of `position`
* @property {function} _positionCallback - private storing of `positionCallback`
*
*/
class Item {

  /**
  * Constructor.
  * @param {array} data - the parameters of this item
  */
  constructor(data={}) {
    this.id = undefined;
    for(const property of this.toBuild()){
      this[property] = data[property];
    }
  }

  /**
   * Return the list of all the properties (other than the id)
   * that should be setup during the construction.
   * The list should be expanded by classes that inherit from Item.
   */
  toBuild(){
    return [
      'global',
      'position',
      'positionCallback'
    ]
  }

  /**
   * Setter for the property `global`
   */
  set global(global){
    if(global == undefined){
      this._global = true;
    }
    else {
      this._global = global;
    }
  }

  get global(){
    return this._global;
  }

  set position(position){
    if(position == undefined){
      this._position = new Position();
    }
    else {
      this._position = position;
    }
  }

  get position(){
    return this._position;
  }

  set positionCallback(positionCallback){
    this._positionCallback = positionCallback;
  }

  get positionCallback(){
    return this._positionCallback;
  }

  /**
  * Say if the item is a light
  * @return {bool} true if the item is a light
  */
  isLight(){
    throw new Error("This method need be overloaded.")
  }

  /**
  * Say if the item is an objects
  * @return {bool} true if the item is an object
  */
  isSolid(){
    throw new Error("This method need be overloaded.")
  }
}


/**
* @class
*
* @classdesc
* Generic class for objects in the scene
* The class is named Solid, as Object is a built-in name in Javascript
* This class should never be instantiated directly.
* Classes that inherit from Object can be instantiated.
*
* @property {Material}  _material - private storing of `material`
*/

class Solid extends Item {

  /**
  * Constructor.
  * @param {array} data - the parameters of this object
  * @todo Decide what arguments the generic constructor should receive
  */
  constructor(data={}) {
    super(data);
  }

  toBuild() {
    const res = super.toBuild();
    res.push('material');
    return res;
  }

  set material(material){
    if(material == undefined){
      this._material = new Material();
    }
    else {
      this._material = material;
    }
  }

  get material(){
    return this._material;
  }

  /**
  * Say if the item is a light
  * @return {bool} true if the item is a light
  */
  isLight(){
    return false;
  }

  /**
  * Say if the item is an objects
  * @return {bool} true if the item is an object
  */
  isSolid(){
    return true;
  }
}


/**
* @class
*
* @classdesc
* Generic class for point lights in the scene.
*
* @property {Vector3}  _color - private storing for color
*
* @todo How do we handle light intensity
*/
class Light extends Item {

  /**
  * Constructor.
  * @param {array} data
  * @todo Decide what arguments the generic constructor should receive
  */
  constructor(data={}) {
    super(data);
  }

  toBuild() {
    const res = super.toBuild();
    res.push('color');
    return res;
  }

  set color(color){
    if(color == undefined){
      this._color = new Vector3(1,1,1);
    }
    else {
      this._color = color;
    }
  }

  get color(){
    return this._color;
  }


  /**
  * Say if the item is a light
  * @return {bool} true if the item is a light
  */
  isLight(){
    return true;
  }

  /**
  * Say if the item is an objects
  * @return {bool} true if the item is an object
  */
  isSolid(){
    return false;
  }
}


export{
  Item,
  Solid,
  Light
}
