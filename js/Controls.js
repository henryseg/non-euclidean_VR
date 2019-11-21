/**
 * Based off code created by:
 * dmarcos / https://github.com/dmarcos
 * hawksley / https://github.com/hawksley
 */
import {
    Vector3,
    Quaternion,
    Matrix4
} from './module/three.module.js';

import {globalVar} from './Main.js';

import {fixOutsideCentralCell} from "./Math.js";

// This file should be geometry independent

let Controls = function (done) {
    // this.phoneVR = new PhoneVR();
    let speed = 0.2;
    //this.defaultPosition = new Vector3();
    this.manualRotateRate = new Float32Array([0.0, 0.0, 0.0]);
    this.manualMoveRate = new Float32Array([0.0, 0.0, 0.0]);
    this.updateTime = 0;

    switch (globalVar.g_keyboard) {
        case 'fr':
            this.manualControls = {
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
            break;
        default:
            this.manualControls = {
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
    }

    this._init = function(){
        let self = this;
        this._oldVRState = undefined;
        if(!navigator.getVRDisplays && !navigator.mozGetVRDevices && !navigator.getVRDevices) 
            return;
        if(navigator.getVRDisplays)
            navigator.getVRDisplays().then(gotVRDisplay);
        else if(navigator.getVRDevices)
            navigator.getVRDevices().then(gotVRDevices);
        else
            navigator.mozGetVRDevices(gotVRDevices);

        function gotVRDisplay(devices){
            var vrInput;
            var error;
            for(var i = 0; i < devices.length; i++){
                if(devices[i] instanceof VRDisplay){
                    vrInput = devices[i];
                    self._vrInput = vrInput;
                    break;
                }
            }
        }

        function gotVRDevices(devices){
            var vrInput;
            var error;
            for(var i = 0; i < devices.length; i++){
                if(devices[i] instanceof PositionSensorVRDevice){
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
        let deltaPosition = new Vector3();

        //Check if head has translated (tracking)
        if(vrState !== null && vrState.hmd.lastPosition !== undefined && vrState.hmd.position[0] !== 0){
            let quat = vrState.hmd.rotation.clone().inverse();
            deltaPosition = new Vector3().subVectors(vrState.hmd.position, vrState.hmd.lastPosition)//.applyQuaternion(quat);
        }

        if (this.manualMoveRate[0] !== 0 || this.manualMoveRate[1] !== 0 || this.manualMoveRate[2] !== 0) {
            //console.log('ici');
            deltaPosition = globalVar.g_position.getFwdVector().multiplyScalar(speed * deltaTime * (this.manualMoveRate[0]));
            deltaPosition = deltaPosition.add(globalVar.g_position.getRightVector().multiplyScalar(speed * deltaTime * this.manualMoveRate[1]));
            deltaPosition = deltaPosition.add(globalVar.g_position.getUpVector().multiplyScalar(speed * deltaTime * this.manualMoveRate[2]));
        }
        globalVar.g_position.localFlow(deltaPosition);


        let fixIndex = fixOutsideCentralCell(globalVar.g_position); //moves camera back to main cell
        if (fixIndex !== -1) {
            globalVar.g_cellPosition.localTranslateBy(globalVar.invGens[fixIndex]);
            globalVar.g_invCellPosition.getInverse(globalVar.g_cellPosition);
        }


        //--------------------------------------------------------------------
        // Rotation
        //--------------------------------------------------------------------
        let deltaRotation = new Quaternion(
            this.manualRotateRate[0] * speed * deltaTime,
            this.manualRotateRate[1] * speed * deltaTime,
            this.manualRotateRate[2] * speed * deltaTime,
            1.0
        );

        //Handle Phone Input
        if (globalVar.g_phoneOrient[0] !== null) {
            let rotation = this.getQuatFromPhoneAngles(new Vector3().fromArray(globalVar.g_phoneOrient));
            if (this.oldRotation === undefined) this.oldRotation = rotation;
            deltaRotation = new Quaternion().multiplyQuaternions(this.oldRotation.inverse(), rotation);
            this.oldRotation = rotation;
        }

        deltaRotation.normalize();

        let m = new Matrix4().makeRotationFromQuaternion(deltaRotation); //removed an inverse here
        globalVar.g_position.localRotateFacingBy(m);

        //Check for headset rotation (tracking)
        if(vrState !== null && vrState.hmd.lastRotation !== undefined){
            let rotation = vrState.hmd.rotation;
            deltaRotation.multiplyQuaternions(vrState.hmd.lastRotation.inverse(), vrState.hmd.rotation);
            m = new Matrix4().makeRotationFromQuaternion(deltaRotation); //removed an inverse here
            globalVar.g_position.localRotateFacingBy(m);
        }

    };
    //     // let deltaRotation = new Quaternion(
    //     //     this.manualRotateRate[0] * speed * deltaTime,
    //     //     this.manualRotateRate[1] * speed * deltaTime,
    //     //     this.manualRotateRate[2] * speed * deltaTime,
    //     //     1.0
    //     // );
    //     // deltaRotation.normalize();
    //     // let m = new Matrix4().makeRotationFromQuaternion(deltaRotation); //removed an inverse here

    //     //Handle Phone Input
    //     // if (g_phoneOrient[0] !== null) {
    //     //     let rotation = this.getQuatFromPhoneAngles(new Vector3().fromArray(g_phoneOrient));
    //     //     if (this.oldRotation === undefined) this.oldRotation = rotation;
    //     //     deltaRotation = new Quaternion().multiplyQuaternions(this.oldRotation.inverse(), rotation);
    //     //     this.oldRotation = rotation;
    //     // }

    //     //g_position.localRotateFacingBy(m);       

    //     let deltaRotation= new Quaternion();
    //     let m=new Matrix4();

    //     //Check for headset rotation (tracking)
    //     if(vrState !== null && vrState.hmd.lastRotation !== undefined){
    //         rotation = vrState.hmd.rotation;
    //         deltaRotation.multiplyQuaternions(vrState.hmd.lastRotation.inverse(), vrState.hmd.rotation);
    //         m.makeRotationFromQuaternion(deltaRotation); //removed an inverse here
    //         //g_position.localRotateFacingBy(m);
    //     }
    //     //Check for keyboard
    //     if (this.manualRotateRate[0] !== 0 || this.manualRotateRate[1] !== 0 || this.manualRotateRate[2] !== 0) {
    //         deltaRotation.set(
    //             this.manualRotateRate[0] * speed * deltaTime,
    //             this.manualRotateRate[1] * speed * deltaTime,
    //             this.manualRotateRate[2] * speed * deltaTime,
    //             1.0
    //         );
    //         deltaRotation.normalize();
    //         m.makeRotationFromQuaternion(deltaRotation); //removed an inverse here
    //     }         
    //     //console.log(deltaRotation);
    //     g_position.localRotateFacingBy(m);

    // };

    this.getVRState = function(){
        var vrInput = this._vrInput;
        var oldVRState = this._oldVRState;
        var orientation = new Quaternion();
        var pos = new Vector3();
        var vrState;

        if(vrInput){
            if(vrInput.getState !== undefined){ 
                orientation.fromArray(vrInput.getState().orientation);
                pos.fromArray(vrInput.getState().position);
            }
            else{
                var framedata = new VRFrameData();
                vrInput.getFrameData(framedata);
                if(framedata.pose.orientation !== null  && framedata.pose.position !== null){
                    orientation.fromArray(framedata.pose.orientation);
                    pos.fromArray(framedata.pose.position);
                }
            }
        }

        else return null;
        if(orientation === null) return null;

        vrState = {
            hmd: {
                rotation: orientation,
                position: pos
            }
        };
        
        if(oldVRState !== undefined){
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

export{Controls};
