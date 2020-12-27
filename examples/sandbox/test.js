import * as utils from "../../js/utils.js";
import {Matrix4, Quaternion, Vector3} from "../../js/lib/three.module.js";

const a = 0.5;
const c = 0.5 * Math.sqrt(3);
console.log('a', a);
console.log('c', c);


const t = 1;

console.log('cos(ct)', Math.cos(c * t));
console.log('sin(ct)', Math.sin(c * t));


const ex = new Vector3(1, 0, 0);
const ey = new Vector3(0, 1, 0);
const ez = new Vector3(0, 0, 1);


const alpha = 0.2 * Math.PI;
console.log('alpha', Math.cos(alpha), Math.sin(alpha));
const q = new Quaternion().setFromAxisAngle(ez,alpha);
console.log(q.toLog());
console.log(new Matrix4().makeRotationFromQuaternion(q.conjugate()).toLog());