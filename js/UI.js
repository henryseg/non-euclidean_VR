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
        globalSphereRad: 0.2,
        centerSphereRad: 0.99,
        vertexSphereRad: -0.95
    };

    var gui = new dat.GUI();
    gui.close();
    gui.add(guiInfo, 'GetHelp').name("Help/About");

    var globalSphereRadController = gui.add(guiInfo, 'globalSphereRad', 0.0, 1.5).name("Earth radius");

    var centerSphereRadController = gui.add(guiInfo, 'centerSphereRad', 0.6, 1.3).name("Center Sphere");

    var vertexSphereRadController = gui.add(guiInfo, 'vertexSphereRad', -1.1, -0.7).name("Vertex Sphere");

    // ------------------------------
    // UI Controllers
    // ------------ ------------------

    globalSphereRadController.onChange(function (value) {
        g_material.uniforms.globalSphereRad.value = value;
    });

    centerSphereRadController.onChange(function (value) {
        g_material.uniforms.centerSphereRad.value = value;
    });

    vertexSphereRadController.onChange(function (value) {
        g_material.uniforms.vertexSphereRad.value = value;
    });




}
