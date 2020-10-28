/**
 * Based off code created by:
 * dmarcos / https://github.com/dmarcos
 * hawksley / https://github.com/hawksley
 */
import {
    Vector3,
    Quaternion,
    Matrix4
} from "./module/three.module.js";
import {
    Vector
} from "./Geometry.js";

import {
    globals
} from "./Main.js";

import {
    fixOutsideCentralCell
} from "./Math.js";


// get the angle and axis of a rotation given by a quaternion
// recall that if a unit quaternion has the form
// q = cos(alpha/2) + sin(alpha/2) u
// the it represents a rotation of angle alpha around the axis u
// We assume below that alpha is in [0, 2pi] so that sin(alpha/2) is non-negative.
Quaternion.prototype.extractAngle = function () {
    let aux = this.clone();
    aux.normalize();
    return 2 * Math.acos(aux.w);
}

Quaternion.prototype.extractAxis = function () {
    let aux = this.clone();
    aux.normalize();
    let sinAngleOver2 = Math.sqrt(1 - aux.w * aux.w);
    return new Vector3(
        aux.x / sinAngleOver2,
        aux.y / sinAngleOver2,
        aux.z / sinAngleOver2
    );
}



// This file should be geometry independent

let Controls = function () {
    // this.phoneVR = new PhoneVR();
    let speed = 0.2;
    //this.defaultPosition = new Vector3();
    this.manualRotateRate = new Float32Array([0.0, 0.0, 0.0]);
    this.manualMoveRate = new Float32Array([0.0, 0.0, 0.0]);
    this.updateTime = 0;

    let keyboardFR = {
        81: {
            index: 1,
            sign: 1,
            active: 0
        }, // q
        68: {
            index: 1,
            sign: -1,
            active: 0
        }, // d
        90: {
            index: 0,
            sign: 1,
            active: 0
        }, // z
        83: {
            index: 0,
            sign: -1,
            active: 0
        }, // s
        65: {
            index: 2,
            sign: -1,
            active: 0
        }, // a
        69: {
            index: 2,
            sign: 1,
            active: 0
        }, // e
        38: {
            index: 3,
            sign: 1,
            active: 0
        }, // up
        40: {
            index: 3,
            sign: -1,
            active: 0
        }, // down
        37: {
            index: 4,
            sign: -1,
            active: 0
        }, // left
        39: {
            index: 4,
            sign: 1,
            active: 0
        }, // right
        165: {
            index: 5,
            sign: 1,
            active: 0
        }, // ù
        61: {
            index: 5,
            sign: -1,
            active: 0
        }, // =
    };
    let keyboardUS = {
        65: {
            index: 1,
            sign: 1,
            active: 0
        }, // a
        68: {
            index: 1,
            sign: -1,
            active: 0
        }, // d
        87: {
            index: 0,
            sign: 1,
            active: 0
        }, // w
        83: {
            index: 0,
            sign: -1,
            active: 0
        }, // s
        81: {
            index: 2,
            sign: -1,
            active: 0
        }, // q
        69: {
            index: 2,
            sign: 1,
            active: 0
        }, // e
        38: {
            index: 3,
            sign: 1,
            active: 0
        }, // up
        40: {
            index: 3,
            sign: -1,
            active: 0
        }, // down
        37: {
            index: 4,
            sign: -1,
            active: 0
        }, // left
        39: {
            index: 4,
            sign: 1,
            active: 0
        }, // right
        222: {
            index: 5,
            sign: 1,
            active: 0
        }, // single quote
        191: {
            index: 5,
            sign: -1,
            active: 0
        }, // fwd slash
    };

    this.setKeyboard = function (keyboard) {
        switch (keyboard) {
            case 'fr':
                this.manualControls = keyboardFR;
                break;
            case 'us':
                this.manualControls = keyboardUS;
                break;
            default:
                this.manualControls = keyboardUS;
        }
    };


    this.update = function () {

        let oldTime = this.updateTime;
        let newTime = Date.now();
        this.updateTime = newTime;

        //--------------------------------------------------------------------
        // Translation
        //--------------------------------------------------------------------
        let deltaTime = (newTime - oldTime) * 0.001;
        let deltaPosition = new Vector().set(0, 0, 0);
        let deltaPositionNonZero = false;


        if (this.manualMoveRate[0] !== 0 || this.manualMoveRate[1] !== 0 || this.manualMoveRate[2] !== 0) {
            deltaPosition = deltaPosition.add(globals.position.getFwdVector().multiplyScalar(speed * deltaTime * this.manualMoveRate[0]));
            deltaPosition = deltaPosition.add(globals.position.getRightVector().multiplyScalar(speed * deltaTime * this.manualMoveRate[1]));
            deltaPosition = deltaPosition.add(globals.position.getUpVector().multiplyScalar(speed * deltaTime * this.manualMoveRate[2]));
            deltaPositionNonZero = true;
        }

        // do not flow if this is not needed !
        if (deltaPositionNonZero) {
            globals.position.flow(deltaPosition);
            //console.log('Flow (position)', globals.position.toLog());

            let fixIndex = fixOutsideCentralCell(globals.position); //moves camera back to main cell
            if (fixIndex !== -1) {
                globals.cellPosition.localTranslateBy(globals.invGens[fixIndex]);
                globals.invCellPosition.translateBy(globals.gens[fixIndex]);
            }
        }

        //--------------------------------------------------------------------
        // Rotation
        //--------------------------------------------------------------------

        let deltaRotation = new Quaternion();
        let deltaRotationNonZero = false;

        if (this.manualRotateRate[0] !== 0 || this.manualRotateRate[1] !== 0 || this.manualRotateRate[2] !== 0) {
            deltaRotation.set(
                this.manualRotateRate[0] * speed * deltaTime,
                this.manualRotateRate[1] * speed * deltaTime,
                this.manualRotateRate[2] * speed * deltaTime,
                1.0
            );
            deltaRotationNonZero = true;
        }

        if (deltaRotationNonZero) {
            deltaRotation.normalize();
            let m = new Matrix4().makeRotationFromQuaternion(deltaRotation); //removed an inverse here
            globals.position.rotateFacingBy(m);
            // console.log("Rotation (angle, axis)", deltaRotation.extractAngle(), deltaRotation.extractAxis());
        }

    };


};

export {
    Controls
};
