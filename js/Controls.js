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

import {globals} from "./Main.js";

import {fixOutsideCentralCell} from "./Math.js";


// some debugging function
// get the angle and axis of a rotation given by a quaternion
// recall that if a unit quaternion has the form
// q = cos(alpha/2) + sin(alpha/2) u
// the it represents a rotation of angle alpha around the axis u
// We assume below that alpha is in [0, 2pi] so that sin(alpha/2) is non-negative.

Quaternion.prototype.extractAngle = function() {
    let aux = this.clone();
    aux.normalize();
    return 2 * Math.acos(aux.w);
}

Quaternion.prototype.extractAxis = function() {
    let aux = this.clone();
    aux.normalize();
    let sinAngleOver2 = Math.sqrt(1 - aux.w * aux.w);
    return new Vector3(
        aux.x / sinAngleOver2,
        aux.y / sinAngleOver2,
        aux.z / sinAngleOver2
    );
}

//console.log("test",new Quaternion().setFromAxisAngle( new Vector3( 0, 1, 0 ), Math.PI ));


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
    this._init = function () {
        let self = this;
        //this.setKeyboard();
        this._oldVRState = undefined;
        if (!navigator.getVRDisplays && !navigator.mozGetVRDevices && !navigator.getVRDevices)
            return;
        if (navigator.getVRDisplays)
            navigator.getVRDisplays().then(gotVRDisplay);
        else if (navigator.getVRDevices)
            navigator.getVRDevices().then(gotVRDevices);
        else
            navigator.mozGetVRDevices(gotVRDevices);

        function gotVRDisplay(devices) {
            let vrInput;
            for (let i = 0; i < devices.length; i++) {
                if (devices[i] instanceof VRDisplay) {
                    vrInput = devices[i];
                    self._vrInput = vrInput;
                    break;
                }
            }
        }

        function gotVRDevices(devices) {
            let vrInput;
            for (let i = 0; i < devices.length; i++) {
                if (devices[i] instanceof PositionSensorVRDevice) {
                    vrInput = devices[i];
                    self._vrInput = vrInput;
                    break;
                }
            }
        }
    };

    this._init();

    this.update = function () {
        let vrState = this.getVRState();
        //let manualRotation = this.manualRotation;
        let oldTime = this.updateTime;
        let newTime = Date.now();
        this.updateTime = newTime;

        //--------------------------------------------------------------------
        // Translation
        //--------------------------------------------------------------------
        let deltaTime = (newTime - oldTime) * 0.001;
        let deltaPosition = new Vector().set(0, 0, 0);
        let deltaPositionNonZero = false;

        //Check if head has translated (tracking)
        if (vrState !== null && vrState.hmd.lastPosition !== undefined && vrState.hmd.position[0] !== 0) {
            //let quat = vrState.hmd.rotation.clone().inverse();
            deltaPosition.subVectors(vrState.hmd.position, vrState.hmd.lastPosition)//.applyQuaternion(quat);
            deltaPositionNonZero = true;
        }

        if (this.manualMoveRate[0] !== 0 || this.manualMoveRate[1] !== 0 || this.manualMoveRate[2] !== 0) {
            deltaPosition = deltaPosition.add(globals.position.getFwdVector().multiplyScalar(speed * deltaTime * this.manualMoveRate[0]));
            deltaPosition = deltaPosition.add(globals.position.getRightVector().multiplyScalar(speed * deltaTime * this.manualMoveRate[1]));
            deltaPosition = deltaPosition.add(globals.position.getUpVector().multiplyScalar(speed * deltaTime * this.manualMoveRate[2]));
            deltaPositionNonZero = true;
        }

        // do not flow if this is not needed !
        if (deltaPositionNonZero) {
            globals.position.flow(deltaPosition);
            console.log('Flow (position)', globals.position.boost.target);

            let fixIndex = fixOutsideCentralCell(globals.position); //moves camera back to main cell
            if (fixIndex !== -1) {
                globals.cellPosition.localTranslateBy(globals.invGens[fixIndex]);
                globals.invCellPosition.getInverse(globals.cellPosition);
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

        //Handle Phone Input
        if (globals.phoneOrient[0] !== null) {
            let rotation = this.getQuatFromPhoneAngles(new Vector3().fromArray(globals.phoneOrient));
            if (this.oldRotation === undefined) this.oldRotation = rotation;
            deltaRotation = new Quaternion().multiplyQuaternions(this.oldRotation.inverse(), rotation);
            this.oldRotation = rotation;
        }

        if(deltaRotationNonZero) {
            deltaRotation.normalize();
            let m = new Matrix4().makeRotationFromQuaternion(deltaRotation); //removed an inverse here
            globals.position.rotateFacingBy(m);
            console.log("Rotation (angle, axis)", deltaRotation.extractAngle(), deltaRotation.extractAxis());
        }

        //Check for headset rotation (tracking)
        if (vrState !== null && vrState.hmd.lastRotation !== undefined) {
            //let rotation = vrState.hmd.rotation;
            deltaRotation.multiplyQuaternions(vrState.hmd.lastRotation.inverse(), vrState.hmd.rotation);
            let m = new Matrix4().makeRotationFromQuaternion(deltaRotation); //removed an inverse here
            globals.position.rotateFacingBy(m);
        }

    };

    this.getVRState = function () {
        let vrInput = this._vrInput;
        let oldVRState = this._oldVRState;
        let orientation = new Quaternion();
        let pos = new Vector3();
        let vrState;

        if (vrInput) {
            if (vrInput.getState !== undefined) {
                orientation.fromArray(vrInput.getState().orientation);
                pos.fromArray(vrInput.getState().position);
            } else {
                let framedata = new VRFrameData();
                vrInput.getFrameData(framedata);
                if (framedata.pose.orientation !== null && framedata.pose.position !== null) {
                    orientation.fromArray(framedata.pose.orientation);
                    pos.fromArray(framedata.pose.position);
                }
            }
        } else {
            return null;
        }
        //if(orientation === null) return null;

        vrState = {
            hmd: {
                rotation: orientation,
                position: pos
            }
        };

        if (oldVRState !== undefined) {
            vrState.hmd.lastPosition = oldVRState.hmd.position;
            vrState.hmd.lastRotation = oldVRState.hmd.rotation;
        }

        this._oldVRState = vrState;
        return vrState;
    };

    //--------------------------------------------------------------------
    // Get phone orientation info
    //--------------------------------------------------------------------
    this.getScreenOrientation = function () {
        switch (window.screen.orientation || window.screen.mozOrientation) {
            case 'landscape-primary':
                return 90;
            case 'landscape-secondary':
                return -90;
            case 'portrait-secondary':
                return 180;
            case 'portrait-primary':
                return 0;
        }
        // REMI. It seems that there is something deprecated here. Fix it ?
        if (window.orientation !== undefined)
            return window.orientation;
    };


    this.getQuatFromPhoneAngles = function (angles) {
        const degtorad = Math.PI / 180; // Degree-to-Radian conversion
        let z = angles.z * degtorad / 2;
        let x = angles.x * degtorad / 2;
        let y = angles.y * degtorad / 2;
        let cX = Math.cos(x);
        let cY = Math.cos(y);
        let cZ = Math.cos(z);
        let sX = Math.sin(x);
        let sY = Math.sin(y);
        let sZ = Math.sin(z);

        // ZXY quaternion construction.
        let w = cX * cY * cZ - sX * sY * sZ;
        x = sX * cY * cZ - cX * sY * sZ;
        y = cX * sY * cZ + sX * cY * sZ;
        z = cX * cY * sZ + sX * sY * cZ;

        // REMI: x,y,z are used above for two different quantities, not very good practice.

        let deviceQuaternion = new Quaternion(x, y, z, w);

        // Correct for the screen orientation.
        let screenOrientation = (this.getScreenOrientation() * degtorad) / 2;
        let screenTransform = new Quaternion(0, 0, -Math.sin(screenOrientation), Math.cos(screenOrientation));

        let deviceRotation = new Quaternion();
        deviceRotation.multiplyQuaternions(deviceQuaternion, screenTransform);

        // deviceRotation is the quaternion encoding of the transformation
        // from camera coordinates to world coordinates.  The problem is that
        // our shader uses conventional OpenGL coordinates
        // (+x = right, +y = up, +z = backward), but the DeviceOrientation
        // spec uses different coordinates (+x = East, +y = North, +z = up).
        // To fix the mismatch, we need to fix this.  We'll arbitrarily choose
        // North to correspond to -z (the default camera direction).
        const r22 = Math.sqrt(0.5);
        deviceRotation.multiplyQuaternions(new Quaternion(-r22, 0, 0, r22), deviceRotation);

        return deviceRotation;
    }
};

export {Controls};
