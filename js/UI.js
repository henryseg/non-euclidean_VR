//-------------------------------------------------------
// UI Variables
//-------------------------------------------------------

var guiInfo;

// Inputs are from the UI parameterizations.
// gI is the guiInfo object from initGui


//What we need to init our dat GUI
var initGui = function () {
    guiInfo = { //Since dat gui can only modify object values we store variables here.
        GetHelp: function () {
            window.open('https://github.com/henryseg/non-euclidean_VR');
        },
        toggleUI: true,
        // globalSphereRad: 0.2,
        ipDist: 0.032,
        earthRad: 0.2,
        centerSphereRad: 1.,
        vertexSphereRad: -0.98,
        localLightIntensity: 0.2,
        cubeHalfWidth: 0.6584789485,
        stereoScreenOffset: g_stereoScreenOffset
    };

    var gui = new dat.GUI();
    gui.close();
    gui.add(guiInfo, 'GetHelp').name("Help/About");


    var earthRadController = gui.add(guiInfo, 'earthRad', 0.0, 1.5).name("Earth radius");

    var centerSphereRadController = gui.add(guiInfo, 'centerSphereRad', 0.6, 1.3).name("Center Sphere");

    var vertexSphereRadController = gui.add(guiInfo, 'vertexSphereRad', -1.1, -0.8).name("Vertex Sphere");

    var localLightController = gui.add(guiInfo, 'localLightIntensity', 0., 1.).name("Local Light");

    var cubeHalfWidthController = gui.add(guiInfo, 'cubeHalfWidth', 0., 1.).name("CubeHalfWidth");


    var ipDistController = gui.add(guiInfo, 'ipDist', 0.0, 0.5).name("ip Dist");
    var stereoScreenOffsetController = gui.add(guiInfo, 'stereoScreenOffset', 0.02, 0.04).name("Stereo offset");

    // ------------------------------
    // UI Controllers
    // ------------ ------------------

    //  globalSphereRadController.onChange(function(value){
    //    g_material.uniforms.globalSphereRad.value = value;
    //  });


    ipDistController.onChange(function (value) {
        ipDist = value;

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
    });


    stereoScreenOffsetController.onChange(function (value) {
        g_stereoScreenOffset = value;
        g_material.uniforms.stereoScreenOffset.value = value;
    });

    earthRadController.onChange(function (value) {
        g_material.uniforms.earthRad.value = value;
        g_material.uniforms.moonRad.value = 0.2 * value;
        g_material.uniforms.sunRad.value = 2 * value;
    });

    centerSphereRadController.onChange(function (value) {
        g_material.uniforms.centerSphereRad.value = value;
    });

    vertexSphereRadController.onChange(function (value) {
        g_material.uniforms.vertexSphereRad.value = value;
    });

    localLightController.onChange(function (value) {
        g_material.uniforms.localLightIntensity.value = value;
    });


    cubeHalfWidthController.onChange(function (value) {
        //g_material.uniforms.cubeHalfWidth.value = value;
        cubeHalfWidth = value;
        gens = createGenerators();
        invGens = invGenerators(gens);
        invGensMatrices = unpackageMatrix(invGens);
        g_material.uniforms.cubeHalfWidth = value;
        g_material.uniforms.invGenerators.value = invGensMatrices;
    });




    //    cubeHalfWidthController.onChange(function (value) {
    //        g_material.uniforms.cubeHalfWidth.value = value;
    //    });
};
