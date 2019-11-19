//-------------------------------------------------------
// UI Variables
//-------------------------------------------------------

var guiInfo;

// Inputs are from the UI parameterizations.
// gI is the guiInfo object from initGui


//What we need to init our dat GUI
var initGui = function(){
  guiInfo = { //Since dat gui can only modify object values we store variables here.
    GetHelp: function(){
      window.open('https://github.com/henryseg/non-euclidean_VR');
    },
    toggleUI: true,
    globalSphereRad: 0.2,
    modelHalfCube: 0.5
  };

  var gui = new dat.GUI();
  gui.close();
  gui.add(guiInfo, 'GetHelp').name("Help/About");

  var globalSphereRadController = gui.add(guiInfo, 'globalSphereRad',0.0,1.5).name("Earth radius");
  var halfCubeController = gui.add(guiInfo, 'modelHalfCube',0.2,1.5).name("Half cube");

  // ------------------------------
  // UI Controllers
  // ------------ ------------------

  globalSphereRadController.onChange(function(value){
    g_material.uniforms.globalSphereRad.value = value;
  });

  halfCubeController.onChange(function(value){
    cubeHalfWidth = value;
    gens = createGenerators();
    invGens = invGenerators(gens);
    invGensMatrices = unpackageMatrix(invGens);
    g_material.uniforms.modelHalfCube.value = value;
    g_material.uniforms.invGenerators.value = invGensMatrices;
  });
}
