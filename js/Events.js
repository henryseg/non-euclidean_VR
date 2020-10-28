// This file should be geometry independent

import {
    globals
} from "./Main.js";


import {
    guiInfo,
    capturer
} from "./UI.js"

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
    //event.preventDefault();

}

//--------------------------------------------------------------------
// Listen for keys for movement/rotation
//--------------------------------------------------------------------
function key(event, sign) {
    let control = globals.controls.manualControls[event.keyCode];
    if (control === undefined || sign === 1 && control.active || sign === -1 && !control.active) return;

    control.active = (sign === 1);
    if (control.index <= 2) {
        globals.controls.manualRotateRate[control.index] += sign * control.sign;
    } else if (control.index <= 5) {
        globals.controls.manualMoveRate[control.index - 3] += sign * control.sign;
    }
}


//--------------------------------------------------------------------
// Phone screen tap for movement
//--------------------------------------------------------------------

function tap(event, sign) {

}


//--------------------------------------------------------------------
// Listen for mouse clicks
////--------------------------------------------------------------------
function click(event) {

}


//--------------------------------------------------------------------
// Get phone's orientation
//--------------------------------------------------------------------

function initEvents() {
    window.addEventListener("keydown", onkey, false);

    document.addEventListener('keydown', function (event) {
        key(event, 1);
    }, false);
    document.addEventListener('keyup', function (event) {
        key(event, -1);
    }, false);
    //    document.addEventListener('touchstart', function (event) {
    //        tap(event, 1);
    //    }, false);
    //    document.addEventListener('touchend', function (event) {
    //        tap(event, -1);
    //    }, false);
    //document.addEventListener('click', click);
}





export {
    initEvents,
};
