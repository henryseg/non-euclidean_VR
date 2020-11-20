import {
  Vector4,
  Vector3
} from './lib/three.module.js';

import {
  Thurston,
} from './thurston.js';

import {
  Material
} from './material.js';


import * as geom from './geometry/foundations/euc.js';
import * as items from './geometry/items/euc.js';

const thurston = new Thurston(geom);
thurston.init();


const ball0 = new items.Ball({
  center: new geom.Point().set([new Vector4(0,0,-1,1)]),
  radius: 0.4,
  material: new Material({color: new Vector3(1,1,1)})
})

const ball1 = new items.Ball({
  center: new geom.Point().set([new Vector4(-0.3,-0.3,-0.5,1)]),
  radius: 0.2,
  material: new Material({color: new Vector3(0,0,1)})
})

const light0 = new items.PointLight({
  location: new geom.Point().set([new Vector4(1,0,0,1)]),
  color: new Vector3(1,1,0)
});

const light1 = new items.PointLight({
  location: new geom.Point().set([new Vector4(0,1,-1,1)]),
  color: new Vector3(0,1,1)
});

const light2 = new items.PointLight({
  location: new geom.Point().set([new Vector4(-1,-1,1,1)]),
  color: new Vector3(1,0,1)
});


thurston.addItems([ball0, light0, ball1, light1, light2]);

//thurston.animate();
