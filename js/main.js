import {
  Thurston,
} from "./thurston.js"

import {
  Material
} from './material.js'

//import * as geom from './geometry/foundations/euc.js';
//import * as items from './geometry/items/abstract.js'

//const thurston = new Thurston(geom);
/*
thurston.init();
thurston.animate();
*/


class Test {


  constructor() {
    //this._prop = undefined;
  }

  set prop(prop) {
    if(prop == undefined){
      this._prop = 'default'
    }
    else {
      this._prop = prop
    }

  }

  get prop() {
    return this._prop;
  }

  set toto(toto) {
    if(toto == undefined){
      this._toto = 'default'
    }
    else {
      this._toto = toto
    }

  }

  get toto() {
    return this._toto;
  }
}

const test = new Test();

console.log(Object.getOwnPropertyDescriptors(Test));
