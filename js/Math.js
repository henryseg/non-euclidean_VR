// console.log(m) prints column by column, which is not what you expect...
// v.applyMatrix4(m) does m*v
// m.multiply(n) does m*n

//----------------------------------------------------------------------
//	Basic Geometric Operations
//----------------------------------------------------------------------
var Origin = new THREE.Vector4(0, 0, 0, 1);
var cubeHalfWidth = 0.6584789485;


//----------------------------------------------------------------------
//	Matrix Operations
//----------------------------------------------------------------------

THREE.Vector4.prototype.geomDot = function (v) {
    return this.x * v.x + this.y * v.y + this.z * v.z - this.w * v.w;
}

THREE.Vector4.prototype.geomLength = function () {
    return Math.sqrt(Math.abs(this.geomDot(this)));
}

THREE.Vector4.prototype.geomNormalize = function () {
    return this.divideScalar(this.geomLength());
}


function reduceBoostError(boost) {

    var m = boost[0];
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

}



//----------------------------------------------------------------------
//	Moving Around - Translate By Vector
//----------------------------------------------------------------------

function translateByVector(v) { // trickery stolen from Jeff Weeks' Curved Spaces app
    var dx = v.x;
    var dy = v.y;
    var dz = v.z;
    var len = Math.sqrt(dx * dx + dy * dy + dz * dz);

    var c1 = Math.sinh(len);
    var c2 = Math.cosh(len) - 1;

    if (len == 0) return [new THREE.Matrix4().identity()];
    else {
        dx /= len;
        dy /= len;
        dz /= len;
        var m = new THREE.Matrix4().set(
            0, 0, 0, dx,
            0, 0, 0, dy,
            0, 0, 0, dz,
            dx, dy, dz, 0.0);
        var m2 = new THREE.Matrix4().copy(m).multiply(m);
        m.multiplyScalar(c1);
        m2.multiplyScalar(c2);
        var result = new THREE.Matrix4().identity();
        result.add(m);
        result.add(m2);
        return [result];
    }
}


function translateFacingByVector(v) {
    // parallel transport the facing along the geodesic whose unit tangent vector at the origin is v
    return new THREE.Matrix4().set(1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );

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
}

function composeIsom(boost, trans) { // sitting at boost, 
    boost[0].multiply(trans[0]);
    // if we are at boost of b, our position is b.0. We want to fly forward, and t = translateByVector
    // tells me how to do this if I were at 0. So I want to apply b.t.b^-1 to b.0, and I get b.t.0.
    // In other words, translate boost by the conjugate of trans by boost
}

function preComposeIsom(boost, trans) { // deal with a translation of the camera
    boost[0].premultiply(trans[0]);
}

function applyIsom(point, trans) {
    point.applyMatrix4(trans[0]);
}

function rotate(facing, rotMatrix) { // deal with a rotation of the camera
    facing.multiply(rotMatrix);
}

//-----------------------------------------------------------------------------------------------------------------------------
//	Teleporting Back to Central Cell
//-----------------------------------------------------------------------------------------------------------------------------
function geomDist(v) { //good enough for comparison of distances on the hyperboloid. Only used in fixOutsideCentralCell in this file.
    return Math.acosh(v.w);
}


function fixOutsideCentralCell(boost) {
    /*
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
    */
    return -1;
}

//-----------------------------------------------------------------------------------------------------------------------------
//  Tiling Generators Constructors
//-----------------------------------------------------------------------------------------------------------------------------

var createGenerators = function () { /// generators for the tiling by cubes.

    var gen0 = translateByVector(new THREE.Vector3(2. * cubeHalfWidth, 0., 0.));
    var gen1 = translateByVector(new THREE.Vector3(-2. * cubeHalfWidth, 0., 0.));
    var gen2 = translateByVector(new THREE.Vector3(0., 2. * cubeHalfWidth, 0.));
    var gen3 = translateByVector(new THREE.Vector3(0., -2. * cubeHalfWidth, 0.));
    var gen4 = translateByVector(new THREE.Vector3(0., 0., 2. * cubeHalfWidth));
    var gen5 = translateByVector(new THREE.Vector3(0., 0., -2. * cubeHalfWidth));
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

var initGeometry = function () {
    g_currentBoost = [new THREE.Matrix4()];
    g_facing = new THREE.Matrix4();
    g_cellBoost = [new THREE.Matrix4()];
    g_invCellBoost = [new THREE.Matrix4()];
    gens = createGenerators();
    invGens = invGenerators(gens);
    invGensMatrices = unpackage(invGens, 0);
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
var lightColor4 = new THREE.Vector4(256 / 256, 142 / 256, 226 / 256, 1);



var initObjects = function () {
    PointLightObject(new THREE.Vector3(1., 0, 0), lightColor1);
    PointLightObject(new THREE.Vector3(0, 1., 0), lightColor2);
    PointLightObject(new THREE.Vector3(0, 0, 1.), lightColor3);
    PointLightObject(new THREE.Vector3(-1., -1., -1.), lightColor4);
    globalObjectBoost = translateByVector(new THREE.Vector3(0, -1.0, 0));

}

//-------------------------------------------------------
// Set up shader 
//-------------------------------------------------------
// We must unpackage the boost data here for sending to the shader.

var setupMaterial = function (fShader) {
    //these are the left/right translations, rotations and facing corrections for stereo motion

    //facing is a 4x4 matrix, need 3-vector to feed into translatebyvector.
    var preVectorLeft = (new THREE.Vector4(-0.032, 0, 0).applyMatrix4(g_facing));
    var vectorLeft = new THREE.Vector3(preVectorLeft.x, preVectorLeft.y, preVectorLeft.z);

    var preVectorRight = (new THREE.Vector4(0.032, 0, 0).applyMatrix4(g_facing));
    var vectorRight = new THREE.Vector3(preVectorRight.x, preVectorRight.y, preVectorRight.z);


    var leftBoost = translateByVector(vectorLeft);
    var rightBoost = translateByVector(vectorRight);
    var leftFacing = new THREE.Matrix4();
    var rightFacing = new THREE.Matrix4();


    g_material = new THREE.ShaderMaterial({
        uniforms: {

            isStereo: {
                type: "bool",
                value: g_vr
            },
            screenResolution: {
                type: "v2",
                value: g_screenResolution
            },
            lightIntensities: {
                type: "v4",
                value: lightIntensities
            },
            //--- geometry dependent stuff here ---//
            //--- lists of stuff that goes into each invGenerator
            invGenerators: {
                type: "m4",
                value: invGensMatrices
            },
            //--- end of invGen stuff
            currentBoostMat: {
                type: "m4",
                value: g_currentBoost[0]
            },
            leftBoostMat: {
                type: "m4",
                value: leftBoost[0]
            },
            rightBoostMat: {
                type: "m4",
                value: rightBoost[0]
            },
            //currentBoost is an array
            facing: {
                type: "m4",
                value: g_facing
            },
            leftFacing: {
                type: "m4",
                value: leftFacing
            },
            rightFacing: {
                type: "m4",
                value: rightFacing
            },
            cellBoostMat: {
                type: "m4",
                value: g_cellBoost[0]
            },
            invCellBoostMat: {
                type: "m4",
                value: g_invCellBoost[0]
            },
            lightPositions: {
                type: "v4",
                value: lightPositions
            },
            globalObjectBoostMat: {
                type: "m4",
                value: globalObjectBoost[0]
            }
        },

        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: fShader,
        transparent: true
    });
}
