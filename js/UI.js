import {
    globals
} from './Main.js';
import {
    createGenerators,
    invGenerators,
    unpackageMatrix
} from "./Scene.js";
//-------------------------------------------------------
// UI Variables
//-------------------------------------------------------

let guiInfo;
let capturer;

// Inputs are from the UI parameterizations.
// gI is the guiInfo object from initGui


//What we need to init our dat GUI
let initGui = function () {
    guiInfo = { //Since dat gui can only modify object values we store variables here.
        toggleUI: true,
        keyboard: 'us',
        renderShadow: true,
        yourRad: 0.,
        display: 1,
        res: 0.25,
        mirror: 0.1,
        brightness: 0.15,
        recording: false

    };

    let gui = new dat.GUI();
    gui.close();
    // gui.add(guiInfo, 'GetHelp').name("Help/About");

    //    let globalSphereRadController = gui.add(guiInfo, 'globalSphereRad', 0.0, 1.5).name("Earth radius");
    //    let halfCubeController = gui.add(guiInfo, 'modelHalfCube', 0.2, 1.5).name("Half cube");
    //    let ipDistController = gui.add(guiInfo, 'ipDist', 0.0, 0.5).name("ip Dist");
    //    let stereoScreenOffsetController = gui.add(guiInfo, 'stereoScreenOffset', 0.02, 0.04).name("Stereo offset");
    let keyboardController = gui.add(guiInfo, 'keyboard', {
        QWERTY: 'us',
        AZERTY: 'fr'
    }).name("Keyboard");

    let displayController = gui.add(guiInfo, 'display', {
        Tiling: '1',
        Cylinders: '2',
        Lattice: '3'
    });


    let renderShadowController = gui.add(guiInfo, 'renderShadow', {
        Yes: 'true',
        No: 'false'
    }).name('Shadows');

    let yourRadController = gui.add(guiInfo, 'yourRad', 0., 0.25).name("Your Radius");
    let resController = gui.add(guiInfo, 'res', 0., 1.).name("Resolution");
    let mirrorController = gui.add(guiInfo, 'mirror', 0.0, 0.5).name("Mirror");
    let brightnessController = gui.add(guiInfo, 'brightness', 0.0, 0.5).name("Brightness");
    let recordingController = gui.add(guiInfo, 'recording').name("Record video");

    // ------------------------------
    // UI Controllers
    // ------------ ------------------

    //    globalSphereRadController.onChange(function (value) {
    //        globals.material.uniforms.globalSphereRad.value = value;
    //    });
    //
    //    halfCubeController.onChange(function (value) {
    //        globals.cubeHalfWidth = value;
    //        globals.gens = createGenerators();
    //        globals.invGens = invGenerators(globals.gens);
    //        globals.invGensMatrices = unpackageMatrix(globals.invGens);
    //        globals.material.uniforms.modelHalfCube.value = value;
    //        globals.material.uniforms.invGenerators.value = globals.invGensMatrices;
    //    });
    //
    //
    //    ipDistController.onChange(function (value) {
    //        globals.ipDist = value;

    /*
    let vectorLeft = new THREE.Vector3(-value, 0, 0).rotateByFacing(g_position);
    g_leftPosition = g_position.clone().localFlow(vectorLeft);
    g_material.uniforms.leftBoostMat.value = g_leftPosition.boost.matrix;
    g_material.uniforms.leftFacing.value = g_leftPosition.facing;
    let vectorRight = new THREE.Vector3(value, 0, 0).rotateByFacing(g_position);
    g_rightPosition = g_position.clone().localFlow(vectorRight);
    g_material.uniforms.rightBoostMat.value = g_rightPosition.boost.matrix;
    g_material.uniforms.rightFacing.value = g_rightPosition.facing;
    */
    //});


    //    stereoScreenOffsetController.onChange(function (value) {
    //        globals.stereoScreenOffset = value;
    //        globals.material.uniforms.stereoScreenOffset.value = value;
    //    });

    keyboardController.onChange(function (value) {
        globals.controls.setKeyboard(value);
    })

    displayController.onChange(function (value) {
        globals.display = value;
    });

    renderShadowController.onChange(function (value) {
        globals.renderShadow = value;
    });

    yourRadController.onChange(function (value) {
        globals.yourRad = value;
    });


    resController.onChange(function (value) {
        globals.res = value;
    });

    mirrorController.onChange(function (value) {
        globals.mirror = value;
    });


    brightnessController.onChange(function (value) {
        globals.material.uniforms.brightness.value = value;
    });

    recordingController.onFinishChange(function (value) {
        if (value == true) {
            capturer = new CCapture({
                format: 'jpg'
            });
            capturer.start();
        } else {
            capturer.stop();
            capturer.save();
            // onResize(); //Resets us back to window size
        }
    });
};

export {
    initGui,
    guiInfo,
    capturer
}
