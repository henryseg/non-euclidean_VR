/**
 * @author Stewart Smith / http://stewartsmith.io
 * @author Moar Technologies Corp / https://moar.io
 * @author Jeff Nusz / http://custom-logic.com
 * @author Data Arts Team / https://github.com/dataarts
 * @author Rémi Coulon / https://plmlab.math.cnrs.fr/rcoulon/ (refactoring as a JS module)
 */

import {
    Matrix4,
    Vector3,
    Vector4,
    Quaternion,
    Object3D,
    Euler,
	Math as ThreeMath
} from './three.module.js';


let VRController = function (gamepad) {

    let
        key, supported,
        handedness = '',
        axes = [],
        axesMaps = [],
        buttons = [],
        buttonNames = [],
        buttonNamePrimary;

    this.matrixAutoUpdate = false;

    this.standingMatrix = new Matrix4();
    this.head = {

        position: new Vector3(),
        quaternion: new Quaternion()
    };

    this.position = new Vector3();
    this.quaternion = new Quaternion();
    this.lastPos = new Vector3();
    this.lastQuat = new Quaternion();

    this.gamepad = gamepad;
    this.name = gamepad.id;
    this.dof = gamepad.pose ? 3 * (+gamepad.pose.hasOrientation + +gamepad.pose.hasPosition) : 0;

    const vibeChannel = [];
    vibeChannel.name = '';
    vibeChannel.intensity = 0;
    this.vibeChannels = [vibeChannel];
    this.vibeChannels.intensity = 0;
    this.vibeChannels.prior = 0;

    handedness = gamepad.hand;

    axes.byName = {};
    gamepad.axes.forEach(function (axis, i) {
        axes[i] = axis
    });

    //  Similarly we’ll create a default set of button objects.
    buttons.byName = {};
    gamepad.buttons.forEach(function (button, i) {
        buttons[i] = {
            name: 'button_' + i,
            value: button.value,
            isTouched: button.touched,
            isPressed: button.pressed,
            isPrimary: false
        }
    });

    key = Object.keys(VRController.supported).find(function (id) {
        if (gamepad.id.startsWith(id)) return true
    });

    supported = VRController.supported[key];
    if (supported !== undefined) {
        this.style = supported.style;
        if (supported.axes !== undefined) {
            supported.axes.forEach(function (axesMap) {
                axes.byName[axesMap.name] = axesMap.indexes
            })
        }
        if (supported.buttons !== undefined) {
            supported.buttons.forEach(function (buttonName, i) {
                buttons[i].name = buttonName
            })
        }
        buttonNamePrimary = supported.primary
    }

    buttons.forEach(function (button) {
        buttons.byName[button.name] = button
    });

    if (buttonNamePrimary === undefined) buttonNamePrimary = gamepad.buttons.length > 1 ? 'button_1' : 'button_0';
    buttons.byName[buttonNamePrimary].isPrimary = true;

    //  Let’s make some getters!
    this.getHandedness = function () {
        return handedness
    };
    this.getAxis = function (index) {
        return axes[index]
    };
    this.getAxes = function (nameOrIndex) {
        let values = [];
        if (nameOrIndex === undefined) return axes;
        else if (typeof nameOrIndex === 'string') {
            axes.byName[nameOrIndex].forEach(function (index) {
                values.push(axes[index])
            });
            return values
        } else if (typeof nameOrIndex === 'number') return axes[nameOrIndex]
    };
    this.getButton = function (nameOrIndex) {
        if (typeof nameOrIndex === 'string') {
            if (nameOrIndex === 'primary') nameOrIndex = buttonNamePrimary;
            return buttons.byName[nameOrIndex]
        } else if (typeof nameOrIndex === 'number') return buttons[nameOrIndex]
    };

    this.inspect = function () {
        return (
            '#' + gamepad.index + ': ' + gamepad.id +
            '\n\tAxes Names: ' + Object.keys(axes.byName) +
            '\n\tStyle: ' + this.style +
            '\n\tDOF: ' + this.dof +
            '\n\tHandedness: ' + handedness +
            '\n\tPosition: ' + this.position +
            '\n\n\tAxes: ' + axes.reduce(function (a, e, i) {
                return a + e + (i < axes.length - 1 ? ', ' : '')
            }, '') +
            '\n\n\tButton primary: "' + buttonNamePrimary + '"' +
            '\n\tButtons:' + buttons.reduce(function (a, e) {
                return (
                    a +
                    '\n\t\tName: "' + e.name + '"' +
                    '\n\t\t\tValue:     ' + e.value +
                    '\n\t\t\tisTouched: ' + e.isTouched +
                    '\n\t\t\tisPressed: ' + e.isPressed +
                    '\n\t\t\tisPrimary: ' + e.isPrimary

                )
            }, '') +
            '\n\n\tVibration intensity: ' + this.vibeChannels.intensity +
            '\n\tVibration channels:' + this.vibeChannels.reduce(function (a, e) {
                return (
                    a +
                    '\n\t\tName: "' + e.name + '"' +
                    '\n\t\t\tCurrent intensity: ' + e.intensity +
                    e.reduce(function (a2, e2) {
                        return (
                            a2 + '\n\t\t\tat time ' + e2[0] + ' intensity = ' + e2[1]
                        )
                    }, '')
                )
            }, '')
        )
    };

    //  Now we’re ready to listen and compare saved state to current state.
    this.pollForChanges = function () {
        let
            verbosity = VRController.verbosity,
            controller = this,
            controllerInfo = '> #' + controller.gamepad.index + ' ' + controller.gamepad.id + ' (Handedness: ' + handedness + ') ',
            axesNames = Object.keys(axes.byName),
            axesChanged = false;

        //  Did the handedness change?
        if (handedness !== controller.gamepad.hand) {
            if (verbosity >= 0.4) console.log(controllerInfo + 'hand changed from "' + handedness + '" to "' + controller.gamepad.hand + '"');
            handedness = controller.gamepad.hand;
            controller.dispatchEvent({type: 'hand changed', hand: handedness})
        }

        //  Do we have named axes?
        //  If so let’s ONLY check and update those values.
        if (axesNames.length > 0) {
            axesNames.forEach(function (axesName) {
                let axesValues = [];
                axesChanged = false;
                axes.byName[axesName].forEach(function (index) {
                    if (gamepad.axes[index] !== axes[index]) {
                        axesChanged = true;
                        axes[index] = gamepad.axes[index]
                    }
                    axesValues.push(axes[index])
                });
                if (axesChanged) {
                    //  Vive’s thumbpad is the only controller axes that uses
                    //  a “Goofy” Y-axis. We’re going to INVERT it so you
                    //  don’t have to worry about it!
                    if (controller.style === 'vive' && axesName === 'thumbpad') axesValues[1] *= -1;

                    if (verbosity >= 0.7) console.log(controllerInfo + axesName + ' axes changed', axesValues);
                    controller.dispatchEvent({type: axesName + ' axes changed', axes: axesValues})
                }
            })
        }

        //  Otherwise we need to check and update ALL values.
        else {
            gamepad.axes.forEach(function (axis, i) {
                if (axis !== axes[i]) {
                    axesChanged = true;
                    axes[i] = axis
                }
            });
            if (axesChanged) {
                if (verbosity >= 0.7) console.log(controllerInfo + 'axes changed', axes);
                controller.dispatchEvent({type: 'axes changed', axes: axes})
            }
        }

        //  Did any button states change?
        buttons.forEach(function (button, i) {
            let
                controllerAndButtonInfo = controllerInfo + button.name + ' ',
                isPrimary = button.isPrimary,
                eventAction;

            if (button.value !== gamepad.buttons[i].value) {
                button.value = gamepad.buttons[i].value;
                if (verbosity >= 0.6) console.log(controllerAndButtonInfo + 'value changed', button.value);
                controller.dispatchEvent({type: button.name + ' value changed', value: button.value});
                if (isPrimary) controller.dispatchEvent({type: 'primary value changed', value: button.value})
            }
            if (button.isTouched !== gamepad.buttons[i].touched) {
                button.isTouched = gamepad.buttons[i].touched;
                eventAction = button.isTouched ? 'began' : 'ended';
                if (verbosity >= 0.5) console.log(controllerAndButtonInfo + 'touch ' + eventAction);
                controller.dispatchEvent({type: button.name + ' touch ' + eventAction});
                if (isPrimary) controller.dispatchEvent({type: 'primary touch ' + eventAction})
            }
            //  This is the least complicated button property.
            if (button.isPressed !== gamepad.buttons[i].pressed) {
                button.isPressed = gamepad.buttons[i].pressed;
                eventAction = button.isPressed ? 'began' : 'ended';
                if (verbosity >= 0.5) console.log(controllerAndButtonInfo + 'press ' + eventAction);
                controller.dispatchEvent({type: button.name + ' press ' + eventAction});
                if (isPrimary) controller.dispatchEvent({type: 'primary press ' + eventAction})
            }
        })
    }
};

VRController.prototype = Object.create(Object3D.prototype);

VRController.prototype.constructor = VRController;

VRController.prototype.update = function () {
    let
        gamepad = this.gamepad,
        pose = gamepad.pose;

    //All devices should have orientation info
    if (pose.orientation !== null) this.quaternion.fromArray(pose.orientation);

    //6DOF devices should give position info
    if (pose.position !== null) this.position.fromArray(pose.position);
        //console.log(this.position);}

    //3DOF devices need to use an armModel to calculate position info
    else {
        if (this.armModel === undefined) {
            if (VRController.verbosity >= 0.5) console.log('> #' + gamepad.index + ' ' + gamepad.id + ' (Handedness: ' + this.getHandedness() + ') adding OrientationArmModel');
            this.armModel = new OrientationArmModel()
        }
        this.armModel.setHeadPosition(this.head.position);
        this.armModel.setHeadOrientation(this.head.quaternion);
        this.armModel.setControllerOrientation((new Quaternion()).fromArray(pose.orientation));
        this.armModel.update();
        this.position = this.armModel.getPose().position;
        this.quaternion = this.armModel.getPose().orientation;
    }

    if (this.lastPos === new Vector3()) this.lastPos.copy(this.position);
    if (this.lastQuat === new Quaternion()) this.lastQuat.copy(this.quaternion);

    //Grab hmd info
    let vrState = g_controls.getVRState();

    //Update our boost with delta translation
    //let deltaPosition = new Vector3().subVectors(this.position, this.lastPos);
    let headsetOffset = new Vector3().subVectors(this.position, vrState.hmd.position);
    headsetOffset.applyQuaternion(vrState.hmd.rotation.clone().inverse());
    let m = translateByVector(g_geometry, headsetOffset);
    g_controllerBoosts[gamepad.index].copy(m);
    this.lastPos.copy(this.position);

    /*Update our boost with delta rotation
    let deltaRotation = new Quaternion().multiplyQuaternions(this.lastQuat.inverse(), this.quaternion);
    m = new Matrix4().makeRotationFromQuaternion(deltaRotation.inverse());
    g_controllerBoosts[gamepad.index].premultiply(m);
    this.lastQuat.copy(this.quaternion);*/

    //We need to construct a hyperbolic point for calculating dual points
    //Currently hardcoded for hyperbolic space
    //let hyperPos = new Vector4(0,0,0,1).applyMatrix4(g_controllerBoosts[gamepad.index]).applyMatrix4(g_currentBoost);
    //We need to initialize the translateByVector values in initGenerators
    //Since they remain constant
    /*if(gamepad.index === 0){
        g_controllerDualPoints[0] = hyperPos.geometryDirection(g_geometry, hyperPos.applyMatrix4(translateByVector(g_geometry, new Vector3(0.1, 0.0, 0.0))));
        g_controllerDualPoints[1] = hyperPos.geometryDirection(g_geometry, hyperPos.applyMatrix4(translateByVector(g_geometry, new Vector3(0.0, 0.1, 0.0))));
        g_controllerDualPoints[2] = hyperPos.geometryDirection(g_geometry, hyperPos.applyMatrix4(translateByVector(g_geometry, new Vector3(0.0, 0.0, 0.1))));
    }
    else if(gamepad.index === 1){
        g_controllerDualPoints[3] = hyperPos.geometryDirection(g_geometry, hyperPos.applyMatrix4(translateByVector(g_geometry, new Vector3(0.1, 0.0, 0.0))));
        g_controllerDualPoints[4] = hyperPos.geometryDirection(g_geometry, hyperPos.applyMatrix4(translateByVector(g_geometry, new Vector3(0.0, 0.1, 0.0))));
        g_controllerDualPoints[5] = hyperPos.geometryDirection(g_geometry, hyperPos.applyMatrix4(translateByVector(g_geometry, new Vector3(0.0, 0.0, 0.1))));
    }*/

    g_material.uniforms.controllerCount.value = this.controllers.length;
    this.pollForChanges();
    this.applyVibes();
    if (typeof this.updateCallback === 'function') this.updateCallback()
};

VRController.VIBE_TIME_MAX = 5 * 1000;

VRController.prototype.setVibe = function (name, intensity) {
    if (typeof name === 'number' && intensity === undefined) {
        intensity = name;
        name = ''
    }
    if (typeof name === 'string') {
        const
            controller = this,
            o = {};
        let channel = controller.vibeChannels.find(function (channel) {
            return channel.name === name
        });
        if (channel === undefined) {
            channel = [];
            channel.name = name;
            channel.intensity = 0;
            controller.vibeChannels.push(channel)
        } else channel.splice(0);

        if (typeof intensity === 'number') channel.intensity = intensity;
        else {
            if (typeof channel.intensity === 'number') intensity = channel.intensity;
            //  But if we’re SOL then we need to default to zero.
            else intensity = 0
        }

        let cursor = window.performance.now();
        o.set = function (intensity) {
            channel.push([cursor, intensity]);
            return o
        };
        o.wait = function (duration) {
            cursor += duration;
            return o
        };
        return o
    }
};

VRController.prototype.renderVibes = function () {
    //  First we need to clear away any past-due commands,
    //  and update the current intensity value.
    const
        now = window.performance.now(),
        controller = this;

    controller.vibeChannels.forEach(function (channel) {
        while (channel.length && now > channel[0][0]) {
            channel.intensity = channel[0][1];
            channel.shift()
        }
        if (typeof channel.intensity !== 'number') channel.intensity = 0
    });

    //  Now each channel knows its current intensity so we can sum those values.
    const sum = Math.min(1, Math.max(0,
        this.vibeChannels.reduce(function (sum, channel) {
            return sum + +channel.intensity
        }, 0)
    ));
    this.vibeChannels.intensity = sum;
    return sum
};

VRController.prototype.applyVibes = function () {
    if (this.gamepad.hapticActuators &&
        this.gamepad.hapticActuators[0]) {
        const
            renderedIntensity = this.renderVibes(),
            now = window.performance.now();
        if (renderedIntensity !== this.vibeChannels.prior ||
            now - this.vibeChannels.lastCommanded > VRController.VIBE_TIME_MAX / 2) {
            this.vibeChannels.lastCommanded = now;
            this.gamepad.hapticActuators[0].pulse(renderedIntensity, VRController.VIBE_TIME_MAX);
            this.vibeChannels.prior = renderedIntensity
        }
    }
};

//  This makes inspecting through the console a little bit saner.
//  Expected values range from 0 (silent) to 1 (everything).
VRController.verbosity = 0;//0.5 or 0.7 are good...


//  We need to keep a record of found controllers
//  and have some connection / disconnection handlers.
VRController.controllers = [];

VRController.onGamepadConnect = function (gamepad) {
    let
        scope = VRController,
        controller = new scope(gamepad),
        hapticActuators = controller.gamepad.hapticActuators;
    scope.controllers[gamepad.index] = controller;

    if (scope.verbosity >= 0.5) console.log('vr controller connected', controller);
    if (scope.verbosity >= 0.7) console.log(controller.inspect());
    window.setTimeout(function () {
        window.dispatchEvent(new CustomEvent('vr controller connected', {detail: controller}))
    }, 500)
};

VRController.onGamepadDisconnect = function (gamepad) {
    let
        scope = VRController,
        controller = scope.controllers[gamepad.index];

    if (scope.verbosity >= 0.5) console.log('vr controller disconnected', controller);
    controller.dispatchEvent({type: 'disconnected', controller: controller});
    scope.controllers[gamepad.index] = undefined
};

VRController.update = function () {
    let gamepads, gamepad, i;

    if (navigator.getGamepads === undefined) return;
    gamepads = navigator.getGamepads();
    for (i = 0; i < gamepads.length; i++) {
        gamepad = gamepads[i];
        if (gamepad !== undefined &&//  Just for you, Microsoft Edge!
            gamepad !== null &&     //  Meanwhile Chrome and Firefox do it this way.
            gamepad.pose !== undefined &&
            gamepad.pose !== null) {
            if (gamepad.pose.orientation !== null || gamepad.pose.position !== null) {
                if (this.controllers[i] === undefined) VRController.onGamepadConnect(gamepad);
                this.controllers[i].update()
            } else if (this.controllers[i] !== undefined) VRController.onGamepadDisconnect(gamepad)
        }
    }
};

VRController.inspect = function () {
    VRController.controllers.forEach(function (controller) {
        console.log('\n' + controller.inspect())
    })
};


VRController.supported = {
    'Daydream Controller': {
        style: 'daydream',
        axes: [{name: 'thumbpad', indexes: [0, 1]}],
        buttons: ['thumbpad'],
        primary: 'thumbpad'
    },

    'OpenVR Gamepad': {
        style: 'vive',
        axes: [{name: 'thumbpad', indexes: [0, 1]}],
        buttons: ['thumbpad', 'trigger', 'grip', 'menu'],
        primary: 'trigger'
    },

    'Oculus Touch (Right)': {
        style: 'oculus',
        axes: [{name: 'thumbstick', indexes: [0, 1]}],
        buttons: ['thumbstick', 'trigger', 'grip', 'A', 'B', 'thumbrest'],
        primary: 'trigger'
    },
    'Oculus Touch (Left)': {
        style: 'oculus',
        axes: [{name: 'thumbstick', indexes: [0, 1]}],
        buttons: ['thumbstick', 'trigger', 'grip', 'X', 'Y', 'thumbrest'],
        primary: 'trigger'
    },

    'Spatial Controller (Spatial Interaction Source)': {
        style: 'microsoft',
        axes: [
            {name: 'thumbstick', indexes: [0, 1]},
            {name: 'thumbpad', indexes: [2, 3]}
        ],
        buttons: ['thumbstick', 'trigger', 'grip', 'menu', 'thumbpad'],
        primary: 'trigger'
    }
};

function OrientationArmModel() {
    this.isLeftHanded = false;

    //  Current and previous controller orientations.
    this.controllerQ = new Quaternion();
    this.lastControllerQ = new Quaternion();

    //  Current and previous head orientations.
    this.headQ = new Quaternion();

    //  Current head position.
    this.headPos = new Vector3();

    //  Positions of other joints (mostly for debugging).
    this.elbowPos = new Vector3();
    this.wristPos = new Vector3();

    //  Current and previous times the model was updated.
    this.time = null;
    this.lastTime = null;

    //  Root rotation.
    this.rootQ = new Quaternion();

    //  Current pose that this arm model calculates.
    this.pose = {
        orientation: new Quaternion(),
        position: new Vector3()
    }
}


//  STATICS.

Object.assign(OrientationArmModel, {
    HEAD_ELBOW_OFFSET: new Vector3(0.155, -0.465, -0.15),
    ELBOW_WRIST_OFFSET: new Vector3(0, 0, -0.25),
    WRIST_CONTROLLER_OFFSET: new Vector3(0, 0, 0.05),
    ARM_EXTENSION_OFFSET: new Vector3(-0.08, 0.14, 0.08),
    ELBOW_BEND_RATIO: 0.4,//  40% elbow, 60% wrist.
    EXTENSION_RATIO_WEIGHT: 0.4,
    MIN_ANGULAR_SPEED: 0.61//  35˚ per second, converted to radians.
});

//  SETTERS.
//  Methods to set controller and head pose (in world coordinates).
OrientationArmModel.prototype.setControllerOrientation = function (quaternion) {
    this.lastControllerQ.copy(this.controllerQ);
    this.controllerQ.copy(quaternion);
};

OrientationArmModel.prototype.setHeadOrientation = function (quaternion) {
    this.headQ.copy(quaternion);
};

OrientationArmModel.prototype.setHeadPosition = function (position) {
    this.headPos.copy(position);
};

OrientationArmModel.prototype.setLeftHanded = function (isLeftHanded) {//  TODO(smus): Implement me!
    this.isLeftHanded = isLeftHanded;
};

//Called a RAF
//In order for this to work we need to keep controller.head updated
OrientationArmModel.prototype.update = function () {
    this.time = performance.now();
    let
        headYawQ = this.getHeadYawOrientation_(),
        timeDelta = (this.time - this.lastTime) / 1000,
        angleDelta = this.quatAngle_(this.lastControllerQ, this.controllerQ),
        controllerAngularSpeed = angleDelta / timeDelta;

    if (controllerAngularSpeed > OrientationArmModel.MIN_ANGULAR_SPEED) {
        this.rootQ.slerp(headYawQ, angleDelta / 10);// Attenuate the Root rotation slightly.
    } else this.rootQ.copy(headYawQ);

    let controllerEuler = new Euler().setFromQuaternion(this.controllerQ, 'YXZ');
    let controllerXDeg = ThreeMath.radToDeg(controllerEuler.x);
    let extensionRatio = this.clamp_((controllerXDeg - 11) / (50 - 11), 0, 1);

    // Controller orientation in camera space.
    let controllerCameraQ = this.rootQ.clone().inverse();
    controllerCameraQ.multiply(this.controllerQ);

    // Calculate elbow position.
    let elbowPos = this.elbowPos;
    elbowPos.copy(this.headPos).add(OrientationArmModel.HEAD_ELBOW_OFFSET);
    let elbowOffset = new Vector3().copy(OrientationArmModel.ARM_EXTENSION_OFFSET);
    elbowOffset.multiplyScalar(extensionRatio);
    elbowPos.add(elbowOffset);

    let totalAngle = this.quatAngle_(controllerCameraQ, new Quaternion());
    let totalAngleDeg = ThreeMath.radToDeg(totalAngle);
    let lerpSuppression = 1 - Math.pow(totalAngleDeg / 180, 4); // TODO(smus): ???

    let elbowRatio = OrientationArmModel.ELBOW_BEND_RATIO;
    let wristRatio = 1 - OrientationArmModel.ELBOW_BEND_RATIO;
    let lerpValue = lerpSuppression *
        (elbowRatio + wristRatio * extensionRatio * OrientationArmModel.EXTENSION_RATIO_WEIGHT);

    let wristQ = new Quaternion().slerp(controllerCameraQ, lerpValue);
    let invWristQ = wristQ.inverse();
    let elbowQ = controllerCameraQ.clone().multiply(invWristQ);

    let wristPos = this.wristPos;
    wristPos.copy(OrientationArmModel.WRIST_CONTROLLER_OFFSET);
    wristPos.applyQuaternion(wristQ);
    wristPos.add(OrientationArmModel.ELBOW_WRIST_OFFSET);
    wristPos.applyQuaternion(elbowQ);
    wristPos.add(this.elbowPos);

    let offset = new Vector3().copy(OrientationArmModel.ARM_EXTENSION_OFFSET);
    offset.multiplyScalar(extensionRatio);

    let position = new Vector3().copy(this.wristPos);
    position.add(offset);
    position.applyQuaternion(this.rootQ);

    let orientation = new Quaternion().copy(this.controllerQ);

    //  Set the resulting pose orientation and position.
    this.pose.orientation.copy(orientation);
    this.pose.position.copy(position);

    this.lastTime = this.time;
};

//  GETTERS.
//  Returns the pose calculated by the model.
OrientationArmModel.prototype.getPose = function () {
    return this.pose;
};

//  Debug methods for rendering the arm model.
OrientationArmModel.prototype.getForearmLength = function () {
    return OrientationArmModel.ELBOW_WRIST_OFFSET.length();
};

OrientationArmModel.prototype.getElbowPosition = function () {
    let out = this.elbowPos.clone();
    return out.applyQuaternion(this.rootQ);
};

OrientationArmModel.prototype.getWristPosition = function () {
    let out = this.wristPos.clone();
    return out.applyQuaternion(this.rootQ);
};

OrientationArmModel.prototype.getHeadYawOrientation_ = function () {
    let
        headEuler = new Euler().setFromQuaternion(this.headQ, 'YXZ'),
        destinationQ;

    headEuler.x = 0;
    headEuler.z = 0;
    destinationQ = new Quaternion().setFromEuler(headEuler);
    return destinationQ;
};

//  General tools...
OrientationArmModel.prototype.clamp_ = function (value, min, max) {
    return Math.min(Math.max(value, min), max);
};

OrientationArmModel.prototype.quatAngle_ = function (q1, q2) {
    let
        vec1 = new Vector3(0, 0, -1),
        vec2 = new Vector3(0, 0, -1);

    vec1.applyQuaternion(q1);
    vec2.applyQuaternion(q2);
    return vec1.angleTo(vec2);
};

export {VRController};