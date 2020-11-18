import {
  buildFromModel
} from './toolbox.js'

import {
  Vector3
} from './lib/three.module.js'


/**
* @const {Object}
* @default The default values of the Material properties
*/
const materialDefault = {
  color: new Vector3(1,1,1),
  ambient: 0.5,
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
    buildFromModel(this, materialDefault, data);
  }
}

export{
  Material
}
