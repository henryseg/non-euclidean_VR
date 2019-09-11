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

// Constructs a point on the hyperboloid from a direction and a hyperbolic distance from the origin.
// This is only used to place lights, later in this file.
function constructHyperboloidPoint(direction, distance){
	var w = Math.cosh(distance);
	var magSquared = w * w - 1;
	direction.normalize();
	direction.multiplyScalar(Math.sqrt(magSquared));
	return new THREE.Vector4(direction.x, direction.y, direction.z, w);
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
//	Object Constructors
//-----------------------------------------------------------------------------------------------------------------------------

var PointLightObject = function(pos, colorInt){ //position is a euclidean Vector3
	var posMag = pos.length();
	var posDir = pos.normalize();
	lightPositions.push(constructHyperboloidPoint(posDir, posMag));
	lightIntensities.push(colorInt);
}

