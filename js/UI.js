import {globalVar} from './Main.js';
import {createGenerators, invGenerators, unpackageMatrix} from "./Math.js";
//-------------------------------------------------------
// UI Variables
//-------------------------------------------------------

let guiInfo;

// Inputs are from the UI parameterizations.
// gI is the guiInfo object from initGui


//What we need to init our dat GUI
let initGui = function(){
  guiInfo = { //Since dat gui can only modify object values we store variables here.
    GetHelp: function(){
      window.open('https://github.com/henryseg/non-euclidean_VR');
    },
    toggleUI: true,
    globalSphereRad: 0.2,
    modelHalfCube: 0.5,
    ipDist: 0.03200000151991844,
    stereoScreenOffset: globalVar.g_stereoScreenOffset
  };

  let gui = new dat.GUI();
  gui.close();
  gui.add(guiInfo, 'GetHelp').name("Help/About");

  let globalSphereRadController = gui.add(guiInfo, 'globalSphereRad',0.0,1.5).name("Earth radius");
  let halfCubeController = gui.add(guiInfo, 'modelHalfCube',0.2,1.5).name("Half cube");
  let ipDistController = gui.add(guiInfo, 'ipDist',0.0,0.5).name("ip Dist");
  let stereoScreenOffsetController = gui.add(guiInfo, 'stereoScreenOffset',0.02,0.04).name("Stereo offset");

  // ------------------------------
  // UI Controllers
  // ------------ ------------------

  globalSphereRadController.onChange(function(value){
    globalVar.g_material.uniforms.globalSphereRad.value = value;
  });

  halfCubeController.onChange(function(value){
    globalVar.cubeHalfWidth = value;
    globalVar.gens = createGenerators();
    globalVar.invGens = invGenerators(globalVar.gens);
    globalVar.invGensMatrices = unpackageMatrix(globalVar.invGens);
    globalVar.g_material.uniforms.modelHalfCube.value = value;
    globalVar.g_material.uniforms.invGenerators.value = globalVar.invGensMatrices;
  });


  ipDistController.onChange(function(value){
    globalVar.ipDist = value;

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


  stereoScreenOffsetController.onChange(function(value){
    globalVar.g_stereoScreenOffset = value;
    globalVar.g_material.uniforms.stereoScreenOffset.value = value;
  });



};

export{initGui}
