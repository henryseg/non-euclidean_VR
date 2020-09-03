// console.log(m) prints column by column, which is not what you expect...
// v.applyMatrix4(m) does m*v
// m.multiply(n) does m*n

//----------------------------------------------------------------------
//	Basic Geometric Operations
//----------------------------------------------------------------------
var Origin = new THREE.Vector4(0, 0, 0, 1);
//var cubeHalfWidth = 0.6584789485;


//----------------------------------------------------------------------
//	Matrix Operations
//----------------------------------------------------------------------


function reduceBoostError(boost) {
    // A priori nothing to do, since we are working in R^3 (with the Nil metric)
}


//----------------------------------------------------------------------
//	Moving Around - Translate By Vector
//----------------------------------------------------------------------


function nilMatrix(v) {
    // the matrix realizing the left translation by v = (x,y,z)
    return new THREE.Matrix4().set(
        1., 0., 0., v.x,
        0., 1., 0., v.y,
        -0.5 * v.y, 0.5 * v.x, 1., v.z,
        0., 0., 0., 1.
    );
}

function nilMatrixInv(v) {
    // the inverse of the matrix realizing the left translation by v = (x,y,z)
    return new THREE.Matrix4().set(
        1., 0., 0., -v.x,
        0., 1., 0., -v.y,
        0.5 * v.y, -0.5 * v.x, 1., -v.z,
        0., 0., 0., 1.
    );
}


function translateByVector(v) {
    // return the Heisenberg isometry sending the origin to the point reached by the geodesic,
    // whose unit tangent vector at the origin is v
    const len = v.length();
    let achievedPoint = new THREE.Vector3();

    if (v.z === 0.) {
        achievedPoint = v;
    } else {
        const normalizedV = v.clone().normalize();
        let alpha = 0.;
        if (normalizedV.x !== 0 || normalizedV.y !== 0.) {
            alpha = Math.atan2(normalizedV.y, normalizedV.x);
        }
        const w = normalizedV.z;
        const c = Math.sqrt(1 - Math.pow(w, 2));

        achievedPoint = new THREE.Vector3(
            2. * (c / w) * Math.sin(0.5 * w * len) * Math.cos(0.5 * w * len + alpha),
            2. * (c / w) * Math.sin(0.5 * w * len) * Math.sin(0.5 * w * len + alpha),
            w * len + 0.5 * Math.pow(c / w, 2.) * (w * len - Math.sin(w * len))
        );

    }
    const trans = nilMatrix(achievedPoint);
    return [trans];
}

function translateFacingByVector(v) {
    // parallel transport the facing along the geodesic whose unit tangent vector at the origin is v
    const len = v.length();

    if (len === 0.0) {
        return new THREE.Matrix4();
    } else {
        const normalizedV = v.clone().normalize();
        let alpha = 0.;
        if (normalizedV.x !== 0 || normalizedV.y !== 0.) {
            //console.log('alpha', alpha);
            alpha = Math.atan2(normalizedV.y, normalizedV.x);
        }
        const w = normalizedV.z;
        const c = Math.sqrt(1 - Math.pow(w, 2.));

        // Matrix catching the rotation of the unit tangent vector pulled back that the origin
        const R = new THREE.Matrix4().set(
            Math.cos(w * len), -Math.sin(w * len), 0, 0,
            Math.sin(w * len), Math.cos(w * len), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
        // console.log('R',R)

        // Matrix fixing the rotation around the unit tangent vector
        // Change of basis matrix
        let P = new THREE.Matrix4().set(
            c, 0., -w, 0.,
            0., 1., 0., 0.,
            w, 0., c, 0.,
            0., 0., 0., 1.
        );
        // console.log('P',P);

        // Rotation
        let S = new THREE.Matrix4().set(
            1, 0, 0, 0,
            0, Math.cos(0.5 * len), Math.sin(0.5 * len), 0,
            0, -Math.sin(0.5 * len), Math.cos(0.5 * len), 0,
            0, 0, 0, 1
        );
        //console.log('S',S);

        let Pinv = new THREE.Matrix4();
        Pinv.getInverse(P);

        // Rotation by alpha


        const Ralpha = new THREE.Matrix4().set(
            Math.cos(alpha), -Math.sin(alpha), 0, 0,
            Math.sin(alpha), Math.cos(alpha), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
        const RalphaInv = new THREE.Matrix4().set(
            Math.cos(alpha), Math.sin(alpha), 0, 0,
            -Math.sin(alpha), Math.cos(alpha), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );

        return Ralpha.multiply(R).multiply(P).multiply(S).multiply(Pinv).multiply(RalphaInv);
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
//  Tiling Generators Constructors
//-----------------------------------------------------------------------------------------------------------------------------

var createGenerators = function () { /// generators for the tiling by cubes.
    var aux0 = nilMatrix(new THREE.Vector3(1., 0., 0.));
    var aux1 = nilMatrixInv(new THREE.Vector3(1., 0., 0.));
    var aux2 = nilMatrix(new THREE.Vector3(0., 1., 0.));
    var aux3 = nilMatrixInv(new THREE.Vector3(0., 1., 0.));
    var aux4 = nilMatrix(new THREE.Vector3(0., 0., 1.));
    var aux5 = nilMatrixInv(new THREE.Vector3(0., 0., 1.));

    // var aux4 = new THREE.Matrix4().set(
    //     1., 0, 0, 0,
    //     0, 1., 0, 0,
    //     0, 0, 1., 1.,
    //     0, 0, 0, 1.
    // );
    //
    // var aux5 = new THREE.Matrix4().set(
    //     1., 0, 0, 0,
    //     0, 1., 0, 0,
    //     0, 0, 1., -1.,
    //     0, 0, 0, 1.
    // );


    var gen0 = [aux0];
    var gen1 = [aux1];
    var gen2 = [aux2];
    var gen3 = [aux3];
    var gen4 = [aux4];
    var gen5 = [aux5];
    /*var gen0 = translateByVector(new THREE.Vector3(1., 0., 0.));
    var gen1 = translateByVector(new THREE.Vector3(-1., 0., 0.));
    var gen2 = translateByVector(new THREE.Vector3(0., 1., 0.));
    var gen3 = translateByVector(new THREE.Vector3(0., -1., 0.));
    var gen4 = translateByVector(new THREE.Vector3(0., 0., 1.));
    var gen5 = translateByVector(new THREE.Vector3(0., 0., -1.));*/
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
//	Teleporting Back to Central Cell
//-----------------------------------------------------------------------------------------------------------------------------
//
//function fixOutsideCentralCell(boost) {
//    /* var cPos = new THREE.Vector4(0, 0, 0, 1);
//     applyIsom(cPos, boost);
//     var bestDist = geomDist(cPos);
//     var bestIndex = -1;
//     for (var i = 0; i < gens.length; i++) {
//         var pos = cPos.clone();
//         applyIsom(pos, gens[i]);
//         if (geomDist(pos) < bestDist) {
//             bestDist = geomDist(pos);
//             bestIndex = i;
//         }
//     }
//     if (bestIndex != -1) {
//         preComposeIsom(boost, gens[bestIndex]);
//         return bestIndex;
//     } else*/
//    return -1;
//}



function fixOutsideCentralCell(boost) {
    //console.log(boost);
    let p = Origin.clone().applyMatrix4(boost[0]);

    //console.log(p);
    let bestIndex = -1;
    //lattice basis divided by the norm square
    let v1 = new THREE.Vector4(1., 0., 0., 0.);
    let v2 = new THREE.Vector4(0., 1., 0., 0.);
    let v3 = new THREE.Vector4(0., 0., 1., 0.);

//    if (p.dot(v1) > 0.5) {
//        bestIndex = 1;
//    }
//    if (p.dot(v1) < -0.5) {
//        bestIndex = 0;
//    }
//    if (p.dot(v2) > 0.5) {
//        bestIndex = 3;
//    }
//    if (p.dot(v2) < -0.5) {
//        bestIndex = 2;
//    }
    if (p.dot(v3) > 0.5) {
        bestIndex = 5;
    }
    if (p.dot(v3) < -0.5) {
        bestIndex = 4;
    }

    if (bestIndex !== -1) {
        preComposeIsom(boost, gens[bestIndex]);
        return bestIndex;
    } else {
        return -1;
    }
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
    PointLightObject(new THREE.Vector3(0, 1., 1), lightColor2);
    PointLightObject(new THREE.Vector3(-1, 0, 2), lightColor3);
    PointLightObject(new THREE.Vector3(0, -1, -1), lightColor4);

    globalObjectBoost = translateByVector(new THREE.Vector3(0, 0, -0.2));
    localObjectBoost = translateByVector(new THREE.Vector3(0, 0.1, -0.2));
    //localObjectBoost = translateByVector(new THREE.Vector3(0, 0, -0.2));
}







let earthFacing = new THREE.Matrix4();

//spin the earth
stepSize = 0.001;
setInterval(function () {

    let rotMat = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), 0.002);

    earthFacing.multiply(rotMat);
    //console.log(earthFacing);

}, 10);

//-------------------------------------------------------
// Set up shader 
//-------------------------------------------------------
// We must unpackage the boost data here for sending to the shader.

var setupMaterial = function (fShader) {

    //facing is a 4x4 matrix, need 3-vector to feed into translatebyvector.
    var preVectorLeft = (new THREE.Vector4(-0.032, 0, 0).applyMatrix4(g_facing));
    var vectorLeft = new THREE.Vector3(preVectorLeft.x, preVectorLeft.y, preVectorLeft.z);

    var preVectorRight = (new THREE.Vector4(0.032, 0, 0).applyMatrix4(g_facing));
    var vectorRight = new THREE.Vector3(preVectorRight.x, preVectorRight.y, preVectorRight.z);


    var leftBoost = translateByVector(vectorLeft);
    var rightBoost = translateByVector(vectorRight);
    var leftFacing = translateFacingByVector(vectorLeft);
    var rightFacing = translateFacingByVector(vectorRight);



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
            currentBoost: {
                type: "m4",
                value: g_currentBoost[0]
            },
            leftBoost: {
                type: "m4",
                value: leftBoost[0]
            },
            rightBoost: {
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
            cellBoost: {
                type: "m4",
                value: g_cellBoost[0]
            },

            invCellBoost: {
                type: "m4",
                value: g_invCellBoost[0]
            },
            lightPositions: {
                type: "v4",
                value: lightPositions
            },
            globalObjectBoost: {
                type: "m4",
                value: globalObjectBoost[0]
            },
            localEarthBoost: {
                type: "m4",
                value: localObjectBoost[0]
            },
            globalEarthBoost: {
                type: "m4",
                value: globalObjectBoost[0]
            },
            localEarthFacing: {
                type: "m4",
                value: earthFacing
            },
            earthCubeTex: { //earth texture to global object
                type: "t",
                value: new THREE.CubeTextureLoader().setPath('images/cubemap512/')
                    .load([ //Cubemap derived from http://www.humus.name/index.php?page=Textures&start=120
                        'posx.jpg',
                        'negx.jpg',
                        'posy.jpg',
                        'negy.jpg',
                        'posz.jpg',
                        'negz.jpg'
                    ])
            }
        },

        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: fShader,
        transparent: true
    });
}



function updateMaterial() {
    g_material.uniforms.localEarthFacing.value = earthFacing;

}
