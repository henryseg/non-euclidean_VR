// This file should be geometry independent

import {globals} from "./Main.js";

//--------------------------------------------------------------------
// Handle window resize
//--------------------------------------------------------------------
let onResize = function () {
    globals.effect.setSize(window.innerWidth, window.innerHeight);
    if (globals.material != null) {
        globals.material.uniforms.screenResolution.value.x = window.innerWidth;
        globals.material.uniforms.screenResolution.value.y = window.innerHeight;
    }
};

window.addEventListener('resize', onResize, false);

//EVENTS**************************************************************
//--------------------------------------------------------------------
// Handle keyboard events
//--------------------------------------------------------------------
function onkey(event) {
    event.preventDefault();

    //if (event.keyCode === 90) // z
    //    globals.controls.zeroSensor();
    //else
    if (event.keyCode === 70) // f
        globals.effect.setFullScreen(true);
    else if (event.keyCode === 86 || event.keyCode === 13 || event.keyCode === 32)
        globals.effect.toggleVRMode();
}

//--------------------------------------------------------------------
// Listen for keys for movement/rotation
//--------------------------------------------------------------------
function key(event, sign) {
    console.log('event key code', event.keyCode);
    let control = globals.controls.manualControls[event.keyCode];
    console.log('event key controls', control);
    if (control === undefined || sign === 1 && control.active || sign === -1 && !control.active) return;

    control.active = (sign === 1);
    if (control.index <= 2) {
        globals.controls.manualRotateRate[control.index] += sign * control.sign;
        console.log('key event', control.index);
    }
    else if (control.index <= 5) {
        globals.controls.manualMoveRate[control.index - 3] += sign * control.sign;
    }
}


//--------------------------------------------------------------------
// Phone screen tap for movement
//--------------------------------------------------------------------
function resetToMono() {
    globals.vr = 0;
    //set material info
    globals.material.uniforms.isStereo.value = 0;
    globals.material.uniforms.screenResolution.value.x = window.innerWidth;
    globals.material.uniforms.screenResolution.value.y = window.innerHeight;
}

function tap(event, sign) {
    if (event.target.id === "vr-icon") {
        if (globals.vr === 1) resetToMono();
        else {
            globals.material.uniforms.isStereo.value = 1;
            globals.vr = 1;
        }
    }
    globals.controls.manualMoveRate[0] += sign;
}


//--------------------------------------------------------------------
// Listen for mouse clicks
//--------------------------------------------------------------------
function click(event) {
    if (event.target.id === "vr-icon") {
        if (globals.vr === 1) resetToMono();
        else {
            globals.material.uniforms.isStereo.value = 1;
            globals.vr = 1;
        }
    }
    // window.addEventListener('deviceorientation', getScreenOrientation);

    // enable device orientation, taken from https://medium.com/@leemartin/how-to-request-device-motion-and-orientation-permission-in-ios-13-74fc9d6cd140
    // DeviceOrientationEvent.requestPermission()
    // .then(response => {
    //   if (response == 'granted') {
    //     window.addEventListener('deviceorientation', getScreenOrientation)
    //   }
    // })
    // .catch(console.error)
}


//--------------------------------------------------------------------
// Get phone's orientation
//--------------------------------------------------------------------
function getScreenOrientation(event) {
    globals.phoneOrient[0] = event.beta;
    globals.phoneOrient[1] = event.gamma;
    globals.phoneOrient[2] = event.alpha;
}

function initEvents() {
    window.addEventListener("keydown", onkey, false);

    document.addEventListener('keydown', function (event) {
        key(event, 1);
    }, false);
    document.addEventListener('keyup', function (event) {
        key(event, -1);
    }, false);
    document.addEventListener('touchstart', function (event) {
        tap(event, 1);
    }, false);
    document.addEventListener('touchend', function (event) {
        tap(event, -1);
    }, false);
    document.addEventListener('click', click);
}

export{initEvents};