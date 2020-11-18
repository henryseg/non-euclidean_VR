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
* @property {boolean} global  - flag: true if the item is in the global scene, false otherwise
* @property {Position} position - location and facing of the item. The facing only matters for textures?
* @property {function} positionCallback - a function that update the position (for animated objects) Optional
*
*/
class Item {

  /**
  * Constructor.
  * @param {array} data - the parameters of this item
  */
  constructor(data={}) {
    this.id = undefined;
    buildFromModel(this, itemDefault, data);
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
}



/**
* @const {Object}
* @default The default (additional) values of the Object properties
*/
const solidDefault = {
  material: new Material()
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
* @property {Material}  material - material of the item
*/

class Solid extends Item {

  /**
  * Constructor.
  * @param {array} data - the parameters of this object
  * @todo Decide what arguments the generic constructor should receive
  */
  constructor(data={}) {
    super(data);
    buildFromModel(this, solidDefault, data);
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
* @const {Object}
* @default The default (additional) values of the Object properties
*/
const lighDefault = {
  color: new Vector3(1,1,1)
}

/**
* @class
*
* @classdesc
* Generic class for point lights in the scene.
*
* @property {Vector3}  color - the color of the light
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
    buildFromModel(this, lighDefault, data);
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
