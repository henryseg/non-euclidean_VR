/**
* @module Thurston Items
*
* @description
* Add to the Thurston module a library of items (objects, lights, etc)
*/

import{
  Position
} from '../geometry/abstract.js'


/**
* @const {Object}
* @default The default values of the Material properties
*/
const materialDefault = {
  color: new Vector3(1,1,1),
  ambient:0.5,
  diffuse: 0.5,
  specular: 0.5,
  shininess:10,
}

/**
* @class
*
* @classdesc
* Material for objects in the scene
*
* @see Further information on the {@link https://en.wikipedia.org/wiki/Phong_reflection_model|Phong lighting model}
*
* @property {Vector4} color - color of the object
* @property {number} specular - specular reflection constant
* @property {number} diffuse - diffuse reflection constant
* @property {number} ambient - ambient reflection constant
* @property {number} shininess - shininess constant
*
* @todo Decide what to do for texture, color given by formulas, etc.
* The name of the class is in conflict the the Three.js one.
* Do we want to fix this ? Maybe note, modules have tools to handle this situation.
*/
class Material {

  /**
  * Constructor. Build a new material from the given data
  * @param {array} data - the properties of the material
  */
  constructor(data={}) {
    for(const key in materialDefault) {
      if(key in data){
        this[key] = data[key];
      }
      else {
        this[key] = materialDefault[key]
      }
    }
  }
}

/**
* @const {Object}
* @default The default values of the Item properties
*/
const itemDefault = {
  global: true,
  positionCallback: undefined,
}

/**
* @class
*
* @classdesc
* Generic class for items in the scene (objects, lights, etc)
* This class should never be instantiated directly.
*
* @property {number} id - a unique ID
* @property {boolean} global  - flag: true if the item is in the global scene, false otherwise
* @property {Position} position - location and facing of the object. The facing only matters for textures?
* @property {function} positionCallback - a function that update the position (for animated objects) Optional
*
*/

class Item {

  /**
  * Constructor.
  * @param {array} data
  * @todo Decide what arguments the generic constructor should receive
  */
  constructor(id, data={}) {
    this.id = id;
    for(const key in itemDefault) {
      if(key in data){
        this[key] = data[key];
      }
      else {
        this[key] = itemDefault[key]
      }
    }
    if('position' in data) {
      this.position = data.position;
    }
    else {
      this.position = new this.positionType();
    }
  }

  /**
   * Return the type used for position.
   * This getter needs to be overload in each geometry.
   */
  get positionType(){
    return Position;
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
  isObject(){
    throw new Error("This method need be overloaded.")
  }
}



/**
* @class
*
* @classdesc
* Generic class for objects in the scene
* This class should never be instantiated directly.
* Classes that inherit from Object can be instantiated.
*
* @property {Material}  material - material of the item
*/

class Object {

  /**
  * Constructor.
  * @param {array} data
  * @todo Decide what arguments the generic constructor should receive
  */
  constructor(data) {
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
  isObject(){
    return true;
  }
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

class PointLight {

  /**
  * Constructor.
  * @param {array} data
  * @todo Decide what arguments the generic constructor should receive
  */
  constructor(data) {
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
  isObject(){
    return false;
  }
}

export{
  Material,
  Item,
  Object,
  PointLight
}
