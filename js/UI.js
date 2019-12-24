//-------------------------------------------------------
// UI Variables
//-------------------------------------------------------

var guiInfo;
var capturer;

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
    modelHalfCube: 0.5,
    ipDist: 0.03200000151991844,
    // stereoScreenOffset: g_stereoScreenOffset
    recording: false
  };

  var gui = new dat.GUI();
  gui.close();
  gui.add(guiInfo, 'GetHelp').name("Help/About");

  var globalSphereRadController = gui.add(guiInfo, 'globalSphereRad',0.0,1.5).name("Earth radius");
  var halfCubeController = gui.add(guiInfo, 'modelHalfCube',0.2,1.5).name("Half cube");
  var ipDistController = gui.add(guiInfo, 'ipDist',0.0,0.5).name("ip Dist");
  // var stereoScreenOffsetController = gui.add(guiInfo, 'stereoScreenOffset',0.02,0.04).name("Stereo offset");
  var recordingController = gui.add(guiInfo, 'recording').name("Record video");
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


  ipDistController.onChange(function(value){
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


 recordingController.onFinishChange(function(value){
     if(value == true){
       // g_material.uniforms.screenResolution.value.x = g_screenShotResolution.x;
       // g_material.uniforms.screenResolution.value.y = g_screenShotResolution.y;
       // g_effect.setSize(g_screenShotResolution.x, g_screenShotResolution.y);
       capturer = new CCapture( { format: 'jpg' } );
       capturer.start();
     }
     else{
       capturer.stop();
       capturer.save();
       onResize(); //Resets us back to window size
     }
   }); 


  // stereoScreenOffsetController.onChange(function(value){
  //   g_stereoScreenOffset = value;
  //   g_material.uniforms.stereoScreenOffset.value = value;
  // });



};
