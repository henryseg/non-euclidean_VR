// console.log(m) prints column by column, which is not what you expect...

// v.applyMatrix4(m) does m*v

// m.multiply(n) does m*n

//----------------------------------------------------------------------
//	Basic Geometric Operations
//----------------------------------------------------------------------

var Origin = new THREE.Vector4(0, 0, 1, 0);


var cubeHalfWidth = 0.6584789485;
var cubeHalfHeight = 0.6584; //in general could be different


function geomDist(v) { //good enough for comparison of distances on the hyperboloid. Only used in fixOutsideCentralCell in this file.
    return Math.acosh(v.w);
}

//----------------------------------------------------------------------
//	Matrix Operations
//----------------------------------------------------------------------

//REWRITE ALL OF THIS

THREE.Vector4.prototype.geomDot = function (v) {
    // return this.x * v.x + this.y * v.y + this.z * v.z - this.w * v.w;
}

THREE.Vector4.prototype.geomLength = function () {
    //  return Math.sqrt(Math.abs(this.geomDot(this)));
}

THREE.Vector4.prototype.geomNormalize = function () {
    // return this.divideScalar(this.geomLength());
}



function reduceBoostError(boost) { // for H^3, this is gramSchmidt
    /*  var m = boost[0];
      var n = m.elements; //elements are stored in column major order we need row major
      var temp = new THREE.Vector4();
      var temp2 = new THREE.Vector4();
      for (var i = 0; i < 4; i++) { ///normalize row
          var invRowNorm = 1.0 / temp.fromArray(n.slice(4 * i, 4 * i + 4)).geomLength();
          for (var l = 0; l < 4; l++) {
              n[4 * i + l] = n[4 * i + l] * invRowNorm;
          }
          for (var j = i + 1; j < 4; j++) { // subtract component of ith vector from later vectors
              var component = temp.fromArray(n.slice(4 * i, 4 * i + 4)).geomDot(temp2.fromArray(n.slice(4 * j, 4 * j + 4)));
              for (var l = 0; l < 4; l++) {
                  n[4 * j + l] -= component * n[4 * i + l];
              }
          }
      }
      m.elements = n;
      boost[0].elements = m.elements;
      */
}


//----------------------------------------------------------------------
//	Moving Around - Translate By Vector
//----------------------------------------------------------------------




function translateByVector(v) { // trickery stolen from Jeff Weeks' Curved Spaces app
    var dx = v.x;
    var dy = v.y;
    var dz = v.z;
    var len = Math.sqrt(dx * dx + dy * dy);

    var c1 = Math.sinh(len);
    var c2 = Math.cosh(len) - 1;

    if (len != 0) {
        dx /= len;
        dy /= len;
        var m = new THREE.Matrix4().set(
            0, 0, dx, 0,
            0, 0, dy, 0,
            dx, dy, 0, 0,
            0, 0, 0, 0.0);
        var m2 = new THREE.Matrix4().copy(m).multiply(m);
        m.multiplyScalar(c1);
        m2.multiplyScalar(c2);
        var result = new THREE.Matrix4().identity();
        result.add(m);
        result.add(m2);
        // console.log(result, dz);
        return [result, dz];
    } else {
        // console.log(new THREE.Matrix4().identity(), dz);
        return [new THREE.Matrix4().identity(), dz];
    }
}





//----------------------------------------------------------------------
//  Boost Operations  (The boost may not be a single matrix for some geometries)
//----------------------------------------------------------------------

//adding matrices
THREE.Matrix4.prototype.add = function (m) {
    this.set.apply(this, [].map.call(this.elements, function (c, i) {
        return c + m.elements[i]
    }));
};

function setInverse(boost1, boost2) { //set boost1 to be the inverse of boost2
    boost1[0].getInverse(boost2[0]);
    boost1[1] = -boost2[1]; //set vert translate to negative
}

function composeIsom(boost, trans) { // sitting at boost, 
    boost[0].multiply(trans[0]);
    boost[1] += trans[1];
    // if we are at boost of b, our position is b.0. We want to fly forward, and t = translateByVector
    // tells me how to do this if I were at 0. So I want to apply b.t.b^-1 to b.0, and I get b.t.0.
    // In other words, translate boost by the conjugate of trans by boost
}

function preComposeIsom(boost, trans) { // deal with a translation of the camera
    boost[0].premultiply(trans[0]);
    boost[1] += trans[1];
}

function applyIsom(point, trans) {
    point.applyMatrix4(trans[0]);
    point.w += trans[1];
}

function rotate(facing, rotMatrix) { // deal with a rotation of the camera
    facing.multiply(rotMatrix);
}

//-----------------------------------------------------------------------------------------------------------------------------
//	Teleporting Back to Central Cell
//-----------------------------------------------------------------------------------------------------------------------------

function fixOutsideCentralCell(boost) {
    // console.log(boost);
    console.log(g_currentBoost[1]);
    var cPos = new THREE.Vector4(0, 0, 0, 1);
    applyIsom(cPos, boost);
    var bestDist = geomDist(cPos);
    var bestIndex = -1;
    for (var i = 0; i < gens.length; i++) {
        var pos = cPos.clone();
        applyIsom(pos, gens[i]);
        if (geomDist(pos) < bestDist) {
            bestDist = geomDist(pos);
            bestIndex = i;
        }
    }
    if (bestIndex != -1) {
        preComposeIsom(boost, gens[bestIndex]);
        return bestIndex;
    } else
        return -1;
}

//-----------------------------------------------------------------------------------------------------------------------------
//  Tiling Generators Constructors
//-----------------------------------------------------------------------------------------------------------------------------

var createGenerators = function () { /// generators for the tiling by cubes. 
    var gen0 = translateByVector(new THREE.Vector3(2.0 * cubeHalfWidth, 0.0, 0.0));
    var gen1 = translateByVector(new THREE.Vector3(-2.0 * cubeHalfWidth, 0.0, 0.0));
    var gen2 = translateByVector(new THREE.Vector3(0.0, 2.0 * cubeHalfWidth, 0.0));
    var gen3 = translateByVector(new THREE.Vector3(0.0, -2.0 * cubeHalfWidth, 0.0));
    var gen4 = translateByVector(new THREE.Vector3(0.0, 0.0, 2.0 * cubeHalfWidth));
    var gen5 = translateByVector(new THREE.Vector3(0.0, 0.0, -2.0 * cubeHalfWidth));
    return [gen0, gen1, gen2, gen3, gen4, gen5];
}

var invGenerators = function (genArr) {
    return [genArr[1], genArr[0], genArr[3], genArr[2], genArr[5], genArr[4]];
}

//Unpackage boosts into their components (for hyperbolic space, just pull out the matrix which is the first component)
var unpackage = function (genArr, i) {
    var out = [];
    for (var j = 0; j < genArr.length; j++) {
        out.push(genArr[j][i]);
    }
    return out;
}

//-----------------------------------------------------------------------------------------------------------------------------
//	Initialise things
//-----------------------------------------------------------------------------------------------------------------------------

var invGensMatrices; // need lists of things to give to the shader, lists of types of object to unpack for the shader go here
var invGensRs;

var initGeometry = function () {
    g_currentBoost = [new THREE.Matrix4(), 0.];
    g_facing = new THREE.Matrix4();
    g_cellBoost = [new THREE.Matrix4(), 0.];
    g_invCellBoost = [new THREE.Matrix4(), 0.];
    gens = createGenerators();
    console.log('made gens');
    invGens = invGenerators(gens);
    invGensMatrices = unpackage(invGens, 0);
    invGensRs = unpackage(invGens, 1);
}



var PointLightObject = function (pos, colorInt) { //position is a euclidean Vector3
    var lp = Origin.clone();
    applyIsom(lp, translateByVector(pos));
    lightPositions.push(lp);
    lightIntensities.push(colorInt);
}


//DEFINE THE LIGHT COLORS
var lightColor1 = new THREE.Vector4(68 / 256, 197 / 256, 203 / 256, 1);
var lightColor2 = new THREE.Vector4(252 / 256, 227 / 256, 21 / 256, 1);
var lightColor3 = new THREE.Vector4(245 / 256, 61 / 256, 82 / 256, 1);
var lightColor4 = new THREE.Vector4(238 / 256, 142 / 256, 226 / 256, 1);


var initObjects = function () {
    PointLightObject(new THREE.Vector3(1.5 * cubeHalfWidth, 0, 0), lightColor1);
    PointLightObject(new THREE.Vector3(0, 1.5 * cubeHalfWidth, 0), lightColor2);
    PointLightObject(new THREE.Vector3(0, 0, 1.5 * cubeHalfWidth), lightColor3);
    PointLightObject(new THREE.Vector3(-1.5 * cubeHalfWidth, -1.5 * cubeHalfWidth, -1.5 * cubeHalfWidth), lightColor4);
    console.log('made objects');
    globalObjectBoost = translateByVector(new THREE.Vector3(-0.5, 0, 0));
}

//-------------------------------------------------------
// Set up shader 
//-------------------------------------------------------
// We must unpackage the boost data here for sending to the shader.


var raymarchPass = function (screenRes) {
    var pass = new THREE.ShaderPass(THREE.ray);
    // var temp = new THREE.Vector4(0.0,0.0,0.0,g_currentBoost[1]);
    // console.log(temp);
    pass.uniforms.isStereo.value = g_vr;
    pass.uniforms.screenResolution.value = screenRes;
    pass.uniforms.lightIntensities.value = lightIntensities;

    //--- geometry dependent stuff here ---//
    //--- lists of stuff that goes into each invGenerator
    pass.uniforms.invGeneratorMats.value = invGensMatrices;
    pass.uniforms.invGeneratorRs.value = invGensRs;
    //--- end of invGen stuff

    pass.uniforms.currentBoostMat.value = g_currentBoost[0];
    // pass.uniforms.currentBoostR = { value: g_currentBoost[1] };
    // pass.uniforms.currentBoostR.value = lightPositions[0];
    //currentBoost is an array
    pass.uniforms.facing.value = g_facing;
    pass.uniforms.cellBoostMat.value = g_cellBoost[0];
    pass.uniforms.cellBoostR.value = g_cellBoost[1];
    pass.uniforms.invCellBoostMat.value = g_invCellBoost[0];
    pass.uniforms.invCellBoostR.value = g_invCellBoost[1];

    pass.uniforms.lightPositions.value = lightPositions;
    pass.uniforms.globalObjectBoostMat.value = globalObjectBoost[0];
    pass.uniforms.globalObjectBoostR.value = globalObjectBoost[1];
    //--- end of geometry dependent stuff ---//

    return pass;
}
