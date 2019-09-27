//----------------------------------------------------------------------
//	Dot Product
//----------------------------------------------------------------------
THREE.Vector4.prototype.lorentzDot = function(v){
	return this.x * v.x + this.y * v.y + this.z * v.z - this.w * v.w;
}

//----------------------------------------------------------------------
//	Norm & Normalize
//----------------------------------------------------------------------
THREE.Vector4.prototype.geometryLength = function(){
	return Math.sqrt(Math.abs(this.lorentzDot(this)));
}

THREE.Vector4.prototype.geometryNormalize = function(){
	return this.divideScalar(this.geometryLength());
}

//----------------------------------------------------------------------
//	Matrix Operations
//----------------------------------------------------------------------
THREE.Matrix4.prototype.add = function (m) {
  	this.set.apply(this, [].map.call(this.elements, function (c, i) { return c + m.elements[i] }));
};

function reduceBoostError(boost){ // for H^3, this is gramSchmidt
    var m = boost[0].transpose(); 
    var n = m.elements; //elements are stored in column major order we need row major
    var temp = new THREE.Vector4();
    var temp2 = new THREE.Vector4();
    for (var i = 0; i<4; i++) {  ///normalize row
        var invRowNorm = 1.0 / temp.fromArray(n.slice(4*i, 4*i+4)).geometryLength();
        for (var l = 0; l<4; l++) {
            n[4*i + l] = n[4*i + l] * invRowNorm;
        }
        for (var j = i+1; j<4; j++) { // subtract component of ith vector from later vectors
            var component = temp.fromArray(n.slice(4*i, 4*i+4)).lorentzDot(temp2.fromArray(n.slice(4*j, 4*j+4)));
            for (var l = 0; l<4; l++) {
                n[4*j + l] -= component * n[4*i + l];
            }
        }
    }
    m.elements = n;
    boost[0].elements = m.transpose().elements;
}

//----------------------------------------------------------------------
//  Boost Operations  (The boost may not be a single matrix for some geometries)
//----------------------------------------------------------------------

function preTranslate(boost1, boost2){  // deal with a translation of the camera
    boost1[0].premultiply(boost2[0]);
}

function preRotate(boost1, rotMatrix){  // deal with a rotation of the camera
    boost1[0].premultiply(rotMatrix);
}

function setInverse(boost1, boost2){  //set boost1 to be the inverse of boost2
    boost1[0].getInverse(boost2[0]);
}



//----------------------------------------------------------------------
//	Matrix - Generators
//----------------------------------------------------------------------
function translateByVector(v) { // trickery stolen from Jeff Weeks' Curved Spaces app
  	var dx = v.x; var dy = v.y; var dz = v.z;
	var len = Math.sqrt(dx*dx + dy*dy + dz*dz);

	var m03 = dx; var m13 = dy; var m23 = dz;
	var c1 = Math.sinh(len);
	var c2 = Math.cosh(len) - 1;
	m03 /= len; m13 /= len; m23 /= len; 

  	if (len == 0) return new THREE.Matrix4().identity();
  	else{
      dx /= len;
      dy /= len;
      dz /= len;
      var m = new THREE.Matrix4().set(
        0, 0, 0, m03,
        0, 0, 0, m13,
        0, 0, 0, m23,
        dx,dy,dz, 0.0);
      var m2 = new THREE.Matrix4().copy(m).multiply(m);
      m.multiplyScalar(c1);
      m2.multiplyScalar(c2);
      var result = new THREE.Matrix4().identity();
      result.add(m);
      result.add(m2);
      return result;
    }
}

//-----------------------------------------------------------------------------------------------------------------------------
//	Helper Functions
//-----------------------------------------------------------------------------------------------------------------------------

function fakeDist( v ){  //good enough for comparison of distances on the hyperboloid. Only used in fixOutsideCentralCell in this file.
	return v.x*v.x + v.y*v.y + v.z*v.z;
}

////////check if we are still inside the central fund dom, alter boost if so
function fixOutsideCentralCell( boost ) { 
    //assume first in Gens is identity, should probably fix when we get a proper list of matrices
    var cPos = new THREE.Vector4(0,0,0,1).applyMatrix4( boost[0] ); //central
    var bestDist = fakeDist(cPos);
    var bestIndex = -1;
    for (var i=0; i < gens.length; i++){
        pos = new THREE.Vector4(0,0,0,1).applyMatrix4( gens[i] ).applyMatrix4( boost[0] );
        if (fakeDist(pos) < bestDist) {
            bestDist = fakeDist(pos);
            bestIndex = i;
        }
    }
    if (bestIndex != -1){
        boost[0] = boost[0].multiply(gens[bestIndex]);
        return bestIndex;
    }
    else
        return -1;
}

//-----------------------------------------------------------------------------------------------------------------------------
//  Tiling Generators Constructors
//-----------------------------------------------------------------------------------------------------------------------------


var hCWH = 0.6584789485;
var createGenerators = function(){   /// generators for the tiling by cubes. 
  // since transposed matrices are used, we multiply on the right by the later transform
  var gen0 = translateByVector(new THREE.Vector3(2.0*hCWH,0.0,0.0)).multiply(new THREE.Matrix4().makeRotationX(-tau/4).transpose());
  var gen1 = translateByVector(new THREE.Vector3(-2.0*hCWH,0.0,0.0)).multiply(new THREE.Matrix4().makeRotationX(tau/4).transpose());
  var gen2 = translateByVector(new THREE.Vector3(0.0,2.0*hCWH,0.0)).multiply(new THREE.Matrix4().makeRotationY(-tau/4).transpose());
  var gen3 = translateByVector(new THREE.Vector3(0.0,-2.0*hCWH,0.0)).multiply(new THREE.Matrix4().makeRotationY(tau/4).transpose());
  var gen4 = translateByVector(new THREE.Vector3(0.0,0.0,2.0*hCWH)).multiply(new THREE.Matrix4().makeRotationZ(-tau/4).transpose());
  var gen5 = translateByVector(new THREE.Vector3(0.0,0.0,-2.0*hCWH)).multiply(new THREE.Matrix4().makeRotationZ(tau/4).transpose());
/*
  var gen0 = new THREE.Matrix4().makeRotationX(-tau/4).multiply(translateByVector(new THREE.Vector3(2.0*hCWH,0.0,0.0)));
  var gen1 = new THREE.Matrix4().makeRotationX(tau/4).multiply(translateByVector(new THREE.Vector3(-2.0*hCWH,0.0,0.0)));
  var gen2 = new THREE.Matrix4().makeRotationY(-tau/4).multiply(translateByVector(new THREE.Vector3(0.0,2.0*hCWH,0.0)));
  var gen3 = new THREE.Matrix4().makeRotationY(tau/4).multiply(translateByVector(new THREE.Vector3(0.0,-2.0*hCWH,0.0)));
  var gen4 = new THREE.Matrix4().makeRotationZ(-tau/4).multiply(translateByVector(new THREE.Vector3(0.0,0.0,2.0*hCWH)));
  var gen5 = new THREE.Matrix4().makeRotationZ(tau/4).multiply(translateByVector(new THREE.Vector3(0.0,0.0,-2.0*hCWH)));
*/
  return [gen0, gen1, gen2, gen3, gen4, gen5];
}

var invGenerators = function(genArr){
  return [genArr[1],genArr[0],genArr[3],genArr[2],genArr[5],genArr[4]];
}

// The position of the camera, and transformations coming from movement or rotation are all packaged as "boosts"
// For H^3, our boosts are arrays containing a single element: an elt of SO(3,1). 
// For other geometries there may be multiple objects in the array. For example, for non-isotropic spaces,
// we have to deal with rotation carefully: the camera can turn in ways that the geometry has no isometry for.
var packageBoosts = function(genArr){   
  return [[genArr[0]], [genArr[1]], [genArr[2]], [genArr[3]], [genArr[4]], [genArr[5]]]
}

// ARNAUD
var tau = 2*Math.PI;
var createCuspators = function() {
  // we first create m in mathematician's notation
  // matrix m should send the cube corner to infinity
  // and the sphere to a paraboloid zt = x^2+y^2
  var m = new THREE.Matrix4().makeRotationZ(tau/8);
  m.premultiply(new THREE.Matrix4().makeRotationX(Math.acos(1/Math.sqrt(3))));
  m.premultiply(new THREE.Matrix4().set(
     1 , 0 , 0 , 0
   , 0 , 1 , 0 , 0
   , 0 , 0 , 1 , 1
   , 0 , 0 ,-1 , 1
  ));
  // var aux = 1/Math.sqrt(3);
  // TEST: console.log(new THREE.Vector4(aux,aux,aux,1).applyMatrix4(m)); // should return 0,0,2,0 // PASSED 
  // In this program, transposed matrices are used
  m.transpose();
  return [m, new THREE.Matrix4().getInverse(m)];
};
// END - ARNAUD

//-----------------------------------------------------------------------------------------------------------------------------
//	Initialise things
//-----------------------------------------------------------------------------------------------------------------------------

var initGeometry = function(){
  g_currentBoost = [ new THREE.Matrix4() ];  
  g_cellBoost = [ new THREE.Matrix4() ]; 
  g_invCellBoost = [ new THREE.Matrix4() ];
  gens = createGenerators(); 
  invGens = invGenerators(gens); 
  invGenBoosts = packageBoosts(invGens);
  cuspators = createCuspators();
}

var PointLightObject = function(pos, colorInt){ //position is a euclidean Vector3
  lightPositions.push(new THREE.Vector4(0,0,0,1).applyMatrix4(translateByVector(pos)));
  lightIntensities.push(colorInt);
}

var initObjects = function(){
  PointLightObject(new THREE.Vector3(0.8,0,0), new THREE.Vector4(1,0,0,1));
  PointLightObject(new THREE.Vector3(0,0.8,0), new THREE.Vector4(0,1,0,1));
  PointLightObject(new THREE.Vector3(0,0,0.8), new THREE.Vector4(0,0,1,1));
  PointLightObject(new THREE.Vector3(-0.8,-0.8,-0.8), new THREE.Vector4(1,1,1,1));
  globalObjectBoost = new THREE.Matrix4().multiply(translateByVector(new THREE.Vector3(-0.5,0,0)));
}

//-------------------------------------------------------
// Set up shader
//-------------------------------------------------------
// We must unpackage the boost data here for sending to the shader.

var raymarchPass = function(screenRes){
  var pass = new THREE.ShaderPass(THREE.ray);
  pass.uniforms.isStereo.value = g_vr;
  pass.uniforms.screenResolution.value = screenRes;
  pass.uniforms.lightIntensities.value = lightIntensities;

  //--- geometry dependent stuff here ---//
  pass.uniforms.invGenerators.value = invGens;
  pass.uniforms.cuspators.value = cuspators; // ARNAUD
  pass.uniforms.currentBoost.value = g_currentBoost[0];  //currentBoost is an array
  pass.uniforms.cellBoost.value = g_cellBoost[0];
  pass.uniforms.invCellBoost.value = g_invCellBoost[0];
  pass.uniforms.lightPositions.value = lightPositions;
  pass.uniforms.globalObjectBoost.value = globalObjectBoost;
  //--- end of geometry dependent stuff ---//

  return pass;
}

