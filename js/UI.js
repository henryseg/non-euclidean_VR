import {
    globals
} from './Main.js';

//-------------------------------------------------------
// UI Variables
//-------------------------------------------------------

let guiInfo;

// Inputs are from the UI parameterizations.
// gI is the guiInfo object from initGui


//What we need to init our dat GUI
let initGui = function () {
    guiInfo = { //Since dat gui can only modify object values we store variables here.
        GetHelp: function () {
            window.open('https://github.com/henryseg/non-euclidean_VR');
        },
        toggleUI: true,
        //        globalSphereRad: 0.2,
        //        modelHalfCube: 0.5,
        //        ipDist: 0.03200000151991844,
        //        stereoScreenOffset: globals.stereoScreenOffset,
        keyboard: 'fr',
        display: 3,
        res: 1,
        lightRad: 0.02
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
        TorusBundle: '2',
        Dragon: '3',
        DragonPlanes: '4'
    });

    let resController = gui.add(guiInfo, 'res', {
        Low: '1',
        Med: '2',
        High: '3'
    });
    let lightRadController = gui.add(guiInfo, 'lightRad', 0.0, 0.5).name("Light radius");

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
    });

    displayController.onChange(function (value) {
        globals.display = value;
    });

    resController.onChange(function (value) {
        globals.res = value;
    });

    lightRadController.onChange(function (value) {
        globals.material.uniforms.lightRad.value = value;
    });
};

export {
    initGui
}
