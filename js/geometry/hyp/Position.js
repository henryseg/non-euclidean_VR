import {Position} from "../abstract/Position.js";
import {Quaternion} from "../../lib/three.module.js";

Position.prototype.flowFromOrigin = function (v) {
    this.boost.makeTranslationFromDir(v);
    this.quaternion.identity();
    return this;
}

// The name of the stereoMode follow Jeff Weeks
Position.prototype.eyes = function (cameraMatrix, ipDist, stereoMode) {
    const [leftEye, rightEye] = this._eyes(cameraMatrix, ipDist);
    switch (stereoMode) {
        case 'native':
            // rotate the left and right cameras,
            // so that their respective forward directions converge to the same point at infinity
            const t = Math.sinh(0.5 * ipDist);
            const s = t / (1 + Math.sqrt(1 + t * t));
            const rightQuat = new Quaternion(0, s, 0, 1).normalize();
            const leftQuat = rightQuat.clone().conjugate();
            leftEye.applyQuaternion(leftQuat);
            rightEye.applyQuaternion(rightQuat);
            break;
        default:
            // tourist view
            // do nothing
    }
    return [leftEye, rightEye];
}


export {
    Position
}
