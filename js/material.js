import {
  buildFromModel
} from './toolbox.js'

import {
  Vector3
} from './lib/three.module.js'

/**
* @class
*
* @classdesc
* Material for objects in the scene
*
* @see Further information on the {@link https://en.wikipedia.org/wiki/Phong_reflection_model|Phong lighting model}
*
* @property {Vector3} _color - color of the object
* @property {number} _specular - specular reflection constant
* @property {number} _diffuse - diffuse reflection constant
* @property {number} _ambient - ambient reflection constant
* @property {number} _shininess - shininess constant
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
    for(const property of this.toBuild()){
      this[property] = data[property];
    }
  }

  toBuild(){
    return [
      'color',
      'ambient',
      'diffuse',
      'specular',
      'shininess'
    ];
  }

  set color(color) {
    if(color == undefined){
      this._color = new Vector3(1,1,1);
    }
    else {
      this._color = color;
    }
  }

  get color() {
    return this._color;
  }

  set ambient(ambient) {
    if(ambient == undefined){
      this._ambient = 0.5;
    }
    else {
      this._ambient = ambient;
    }
  }

  get ambient() {
    return this._ambient;
  }

  set diffuse(diffuse) {
    if(diffuse == undefined){
      this._diffuse = 0.5;
    }
    else {
      this._diffuse = diffuse;
    }
  }

  get diffuse() {
    return this._diffuse;
  }

  set specular(specular) {
    if(specular == undefined){
      this._specular = 0.5;
    }
    else {
      this._specular = specular;
    }
  }

  get specular() {
    return this._specular;
  }

  set shininess(shininess) {
    if(shininess == undefined){
      this._shininess = 10;
    }
    else {
      this._shininess = shininess;
    }
  }

  get shininess() {
    return this._shininess;
  }
}

export{
  Material
}
