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
        earthRad: 0.08,
        // moonRad: 0.05,
        centerSphereRad: 0.89,
        vertexSphereRad: 0.28,
        ipDist: 0.032
    };

    var gui = new dat.GUI();
    gui.close();
    // gui.add(guiInfo, 'GetHelp').name("Help/About");

    var earthRadController = gui.add(guiInfo, 'earthRad', 0.0, 0.6).name("Earth radius");

    var centerSphereRadController = gui.add(guiInfo, 'centerSphereRad', 0.6, 1.2).name("Center Sphere");

    var vertexSphereRadController = gui.add(guiInfo, 'vertexSphereRad', 0., 0.7).name("Vertex Sphere");

    var ipDistController = gui.add(guiInfo, 'ipDist', 0.0, 0.5).name("ip Dist");

    // ------------------------------
    // UI Controllers
    // ------------ ------------------

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

    ipDistController.onChange(function (value) {
        ipDist = value;
    });

}
