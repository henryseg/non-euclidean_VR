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
    globalSphereRad:0.2
  };

  var gui = new dat.GUI();
  gui.close();
  gui.add(guiInfo, 'GetHelp').name("Help/About");

  var globalSphereRadController = gui.add(guiInfo, 'globalSphereRad',0.0,1.5).name("Earth radius");

  // ------------------------------
  // UI Controllers
  // ------------ ------------------

  globalSphereRadController.onChange(function(value){
    g_material.uniforms.globalSphereRad.value = value; 
  });
}