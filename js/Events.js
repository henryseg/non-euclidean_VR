// This file should be geometry independent

//--------------------------------------------------------------------
// Handle window resize
//--------------------------------------------------------------------
var onResize = function(){
        g_effect.setSize(window.innerWidth, window.innerHeight);
        if(g_material != null){
            g_material.uniforms.screenResolution.value.x = window.innerWidth;
            g_material.uniforms.screenResolution.value.y = window.innerHeight;
        }
  }
  window.addEventListener('resize', onResize, false);

//EVENTS**************************************************************
//--------------------------------------------------------------------
// Handle keyboard events
//--------------------------------------------------------------------
function onkey(event){
    event.preventDefault();

    if(event.keyCode == 90) // z
        g_controls.zeroSensor();
    else if(event.keyCode == 70) // f
        g_effect.setFullScreen(true);
    else if(event.keyCode == 86 || event.keyCode == 13 || event.keyCode == 32)
        g_effect.toggleVRMode();
}

window.addEventListener("keydown", onkey, false);
//--------------------------------------------------------------------
// Listen for keys for movement/rotation
//--------------------------------------------------------------------
function key(event, sign){
var control = g_controls.manualControls[event.keyCode];
if(control == undefined || sign === 1 && control.active || sign == -1 && !control.active) return;

control.active = (sign === 1);
if (control.index <= 2)
    g_controls.manualRotateRate[control.index] += sign * control.sign;
else if (control.index <= 5)
    g_controls.manualMoveRate[control.index - 3] += sign * control.sign;
}

document.addEventListener('keydown', function(event){key(event, 1);}, false);
document.addEventListener('keyup', function(event){key(event, -1);}, false);

//--------------------------------------------------------------------
// Phone screen tap for movement
//--------------------------------------------------------------------
function resetToMono(){
    g_vr = 0;
    //set material info
    g_material.uniforms.isStereo.value = 0;
    g_material.uniforms.screenResolution.value.x = window.innerWidth;
    g_material.uniforms.screenResolution.value.y = window.innerHeight;
}

function tap(event, sign){
    if(event.target.id === "vr-icon"){
        if(g_vr === 1) resetToMono();
        else { g_material.uniforms.isStereo.value = 1; g_vr = 1; }
    }
    g_controls.manualMoveRate[0] += sign;
}

document.addEventListener('touchstart', function(event){tap(event, 1);}, false);
document.addEventListener('touchend', function(event){tap(event, -1);}, false);

//--------------------------------------------------------------------
// Listen for mouse clicks
//--------------------------------------------------------------------
function click(event){
    if(event.target.id === "vr-icon"){
        if(g_vr === 1) resetToMono();
        else{ g_material.uniforms.isStereo.value = 1; g_vr = 1; }
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
document.addEventListener('click', click);

//--------------------------------------------------------------------
// Get phone's orientation
//--------------------------------------------------------------------
function getScreenOrientation(event){
    g_phoneOrient[0] = event.beta;
    g_phoneOrient[1] = event.gamma;
    g_phoneOrient[2] = event.alpha;
}

