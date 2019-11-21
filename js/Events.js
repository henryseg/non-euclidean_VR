// This file should be geometry independent

import {globalVar} from "./Main.js";

//--------------------------------------------------------------------
// Handle window resize
//--------------------------------------------------------------------
let onResize = function () {
    globalVar.g_effect.setSize(window.innerWidth, window.innerHeight);
    if (globalVar.g_material != null) {
        globalVar.g_material.uniforms.screenResolution.value.x = window.innerWidth;
        globalVar.g_material.uniforms.screenResolution.value.y = window.innerHeight;
    }
};

window.addEventListener('resize', onResize, false);

//EVENTS**************************************************************
//--------------------------------------------------------------------
// Handle keyboard events
//--------------------------------------------------------------------
function onkey(event) {
    event.preventDefault();

    if (event.keyCode === 90) // z
        globalVar.g_controls.zeroSensor();
    else if (event.keyCode === 70) // f
        globalVar.g_effect.setFullScreen(true);
    else if (event.keyCode === 86 || event.keyCode === 13 || event.keyCode === 32)
        globalVar.g_effect.toggleVRMode();
}

//--------------------------------------------------------------------
// Listen for keys for movement/rotation
//--------------------------------------------------------------------
function key(event, sign) {
    let control = globalVar.g_controls.manualControls[event.keyCode];
    if (control === undefined || sign === 1 && control.active || sign === -1 && !control.active) return;

    control.active = (sign === 1);
    if (control.index <= 2)
        globalVar.g_controls.manualRotateRate[control.index] += sign * control.sign;
    else if (control.index <= 5)
        globalVar.g_controls.manualMoveRate[control.index - 3] += sign * control.sign;
}


//--------------------------------------------------------------------
// Phone screen tap for movement
//--------------------------------------------------------------------
function resetToMono() {
    globalVar.g_vr = 0;
    //set material info
    globalVar.g_material.uniforms.isStereo.value = 0;
    globalVar.g_material.uniforms.screenResolution.value.x = window.innerWidth;
    globalVar.g_material.uniforms.screenResolution.value.y = window.innerHeight;
}

function tap(event, sign) {
    if (event.target.id === "vr-icon") {
        if (globalVar.g_vr === 1) resetToMono();
        else {
            globalVar.g_material.uniforms.isStereo.value = 1;
            globalVar.g_vr = 1;
        }
    }
    globalVar.g_controls.manualMoveRate[0] += sign;
}


//--------------------------------------------------------------------
// Listen for mouse clicks
//--------------------------------------------------------------------
function click(event) {
    if (event.target.id === "vr-icon") {
        if (globalVar.g_vr === 1) resetToMono();
        else {
            globalVar.g_material.uniforms.isStereo.value = 1;
            globalVar.g_vr = 1;
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
    globalVar.g_phoneOrient[0] = event.beta;
    globalVar.g_phoneOrient[1] = event.gamma;
    globalVar.g_phoneOrient[2] = event.alpha;
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