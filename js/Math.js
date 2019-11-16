// console.log(m) prints column by column, which is not what you expect...
// v.applyMatrix4(m) does m*v
// m.multiply(n) does m*n


//----------------------------------------------------------------------
//	Object oriented version of the geometry
//----------------------------------------------------------------------

/*

    On the JS part
    - Every point is represented by a THREE.Vector4 object,
      whose coordinates corresponds to the coordinates in the appropriate (projective ?) model
    - Every tangent vector at the origin is represented by a THREE.Vector3 object
      i.e. we identify the tangent space at the origin with R^3.

 */

/*

    Representation of an isometry

 */

function Isometry(data) {
    // In the euclidean geometry an Isometry is just a 4x4 matrix.
    // This may change in the H^2 x R case, where we need an additional translation in the z direction
    this.matrix = data[0].clone();

    this.leftMultiply = function (isom) {
        // return the current isometry multiplied on the left by isom
        // i.e. return isom * this
        let resMatrix = isom.matrix.clone().multiply(this.matrix);
        return new Isometry([resMatrix]);
    };

    this.rightMultiply = function (isom) {
        // return the current isometry multiplied on the left by isom
        // i.e. return this * isom
        let resMatrix = this.matrix.clone().multiply(isom.matrix);
        return new Isometry([resMatrix]);
    };

    this.multiply = function (isom) {
        // return this * isom (which is the "natural order" if you read from left to right)
        return this.rightMultiply(isom);
    };

    this.inverse = function () {
        // return the inverse of the given isometry
        let resMatrix = new THREE.Matrix4().getInverse(this.matrix);
        return new Isometry([resMatrix]);
    };

    this.translate = function (point) {
        // apply the isometry to the given point
        return point.clone().applyMatrix4(this.matrix);
    };

    this.equals = function (isom) {
        // test equality of isometries (for debugging purpose mostly)
        return this.matrix.equals(isom.matrix);
    };

    this.clone = function () {
        return new Isometry([this.matrix]);
    };
}

/*

    Representation of the position of the observer
    A position is given by
    - a `boost` which is an Isometry moving the origin to the point where the observer is
    - a `facing` which determines where the observer is looking at. It is a element of SO(3) encoded as a 4x4 matrix
    More precisely the observer is looking at dL * A * e_z where
    - e_z the tangent vector at the origin in the z-direction
    - A is the matrix defining the facing
    - dL is the differential of the isometry

    TODO.
        the set of position is probably a group
        (a semi-direct projection of Isom(X) by SO(3), where Isom(X) acts on SO(3) by conjugation ?)
        acting on the underlying Lie group as follows :
        (boost, facing) * g = boost * g * facing
        so that the inverse of a position if (boost^{-1}, facing^{-1})
        - Clarify this point
        - Define the multiplication law on the boost ?

*/

function Position(isom, facing) {
    this.boost = isom.clone();
    this.facing = facing.clone();

    this.translateBy = function (isom) {
        // translate the position by the given isometry
        let resBoost = isom.multiply(this.boost);
        let resFacing = isom.matrix.clone().multiply(this.facing);
        // at this point the facing is not correct as it contains the translation part from isom
        // fixed by the line below
        resFacing.setPosition(new THREE.Vector3(0.,0.,0.));
        let res = new Position(resBoost, resFacing);
        res.reduceError();
        return res;
    };

    this.localTranslateBy = function (isom) {
        // if we are at boost of b, our position is b.0. We want to fly forward, and isom
        // tells me how to do this if I were at 0. So I want to apply b * isom * b^{-1} to b * 0, and I get b * isom * 0.
        // In other words, translate boost by the conjugate of isom by boost
        // TODO : compute what needs to be done to the facing : simply rotate by boost * isom * boost^{-1} ?
        let resBoost = this.boost.multiply(isom);
        let res = new Position(resBoost, this.facing);
        res.reduceBoostError();
        return res;
    };

    this.rotateFacingBy = function (rotation) {
        // apply the given matrix (on the left) to the current facing and return the new result
        let resFacing = rotation.clone().multiply(this.facing);
        let res = new Position(this.boost, resFacing);
        res.reduceFacingError();
        return res;
    };

    this.flow = function(v) {
        // move the position following the geodesic flow
        // the geodesic starts at the origin, its tangent vector is v
        // parallel transport the facing along the geodesic

        // in Euclidean geometry, just apply a translation
        // Nothing to do on the facing
        let matrix = new THREE.Matrix4().makeTranslation(v.x, v.y, v.z);
        isom = new Isometry([matrix]);
        return this.translateBy(isom);
    };

    this.localFlow = function(v) {
        // move the position following the geodesic flow FROM THE POINT WE ARE AT
        // v is the pull back at the origin of the direction we want to follow
        // TODO. Check the facing
        let matrix = new THREE.Matrix4().makeTranslation(v.x, v.y, v.z);
        isom = new Isometry([matrix]);
        return this.localTranslateBy(isom);
    }

    this.rotateByFacing = function (v) {
        // rotate the given vector by the facing
        // TODO: find a better way to go from Vector3 to Vector4 and conversely
        let aux = new THREE.Vector4(v.x, v.y, v.z, 0);
        let preRes = aux.applyMatrix4(this.facing);
        return new THREE.Vector3(preRes.x, preRes.y, preRes.z)
    };

    this.inverse = function () {
        // return a position that can bring back the current position to the origin position
        let resBoost = this.boost.inverse();
        let resFacing = new THREE.Matrix4().getInverse(this.facing);
        let res = new Position(resBoost, resFacing);
        res.reduceError();
        return res;

    };

    this.getFwdVector = function () {
        // return the vector moving forward (taking into account the facing)
        let v = new THREE.Vector3(0, 0, -1);
        return this.rotateByFacing(v);
    };

    this.getRightVector = function () {
        // return the vector moving right (taking into account the facing)
        let v = new THREE.Vector3(1, 0, 0);
        return this.rotateByFacing(v);
    };

    this.getUpVector = function () {
        // return the vector moving up (taking into account the facing)
        let v = new THREE.Vector3(0, 1, 0);
        return this.rotateByFacing(v);
    };

    this.reduceBoostError = function () {
        // Nothing to do in Euclidean geometry
    };

    this.reduceFacingError = function () {
        // Gram-Schmidt
        // TODO...
        // Right now there is a bug with elements
        /*let columns = this.facing.elements();
        let col0 = columns[0].normalize();
        let aux10 = col0.multiplyScalar(columns[1].dot(col0));
        let col1 = columns[1].sub(aux10).normalize();
        let aux20 = col0.multiplyScalar(columns[2].dot(col0));
        let aux21 = col0.multiplyScalar(columns[2].dot(col1));
        let col2 = columns[2].sub(aux20).sub(aux21).normalize();

        this.facing = new THREE.Matrix4().set(
            col0.x, col1.x, col2.x, 0.,
            col0.y, col1.y, col2.y, 0.,
            col0.z, col1.z, col2.z, 0.,
            0., 0., 0., 1.
        )*/
    };

    this.reduceError = function () {
        this.reduceBoostError();
        this.reduceFacingError();
    };

    this.equals = function (position) {
        // test equality of isometries (for debugging purpose mostly)
        return (this.boost.equals(position.boost) && this.facing.equals(position.facing));
    };

    this.clone = function () {
        return new Position(this.boost, this.facing);
    }
}


//----------------------------------------------------------------------
//	Geometry constants
//----------------------------------------------------------------------

// The identity isometry
const IDENTITY = new Isometry([new THREE.Matrix4()]);
// The point representing the origin
const ORIGIN = new THREE.Vector4(0, 0, 0, 1);
// The origin position : observer at the origin, looking the the negative z-direction
const ORIGIN_POSITION = new Position(IDENTITY.clone(), new THREE.Matrix4());


const cubeHalfWidth = 0.5;


//----------------------------------------------------------------------
//	Moving Around - Translate By Vector
//----------------------------------------------------------------------

// function translateByVector(v) {
//     var dx = v.x;
//     var dy = v.y;
//     var dz = v.z;
//
//     var m = new THREE.Matrix4().set(
//         1, 0, 0, dx,
//         0, 1, 0, dy,
//         0, 0, 1, dz,
//         0, 0, 0, 1);
//     return [m];
// }
//
//
// function translateFacingByVector(v) {
//     // parallel transport the facing along the geodesic whose unit tangent vector at the origin is v
//     return new THREE.Matrix4().set(1, 0, 0, 0,
//         0, 1, 0, 0,
//         0, 0, 1, 0,
//         0, 0, 0, 1
//     );
//
// }

//----------------------------------------------------------------------
//  Boost Operations  (The boost may not be a single matrix for some geometries)
//----------------------------------------------------------------------

// //adding matrices
// THREE.Matrix4.prototype.add = function (m) {
//     this.set.apply(this, [].map.call(this.elements, function (c, i) {
//         return c + m.elements[i]
//     }));
// };
//
// function setInverse(boost1, boost2) { //set boost1 to be the inverse of boost2
//     boost1[0].getInverse(boost2[0]);
// }
//
// function composeIsom(boost, trans) { // sitting at boost,
//     boost[0].multiply(trans[0]);
//     // if we are at boost of b, our position is b.0. We want to fly forward, and t = translateByVector
//     // tells me how to do this if I were at 0. So I want to apply b.t.b^-1 to b.0, and I get b.t.0.
//     // In other words, translate boost by the conjugate of trans by boost
// }
//
// function preComposeIsom(boost, trans) { // deal with a translation of the camera
//     boost[0].premultiply(trans[0]);
// }
//
// function applyIsom(point, trans) {
//     point.applyMatrix4(trans[0]);
// }
//
// function rotate(facing, rotMatrix) { // deal with a rotation of the camera
//     facing.multiply(rotMatrix);
// }

//-----------------------------------------------------------------------------------------------------------------------------
//	Teleporting back to central cell
//-----------------------------------------------------------------------------------------------------------------------------
function geomDist(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}


// TODO. Desactivated for the moment in Controls.js. Need to be fixed
function fixOutsideCentralCell(position) {
    let cPos = position.boost.translate(ORIGIN);
    let bestDist = geomDist(cPos);
    let bestIndex = -1;
    for (let i = 0; i < gens.length; i++) {
        let pos = gens[i].translate(cPos);
        let dist = geomDist(pos);
        if (dist < bestDist) {
            bestDist = dist;
            bestIndex = i;
        }
    }
    if (bestIndex !== -1) {
        position = position.translateBy(gens[bestIndex]);
        position.reduceBoostError();
        return bestIndex;
    } else {
        return -1;
    }

}

/*
function fixOutsideCentralCell(boost) {
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
}*/

//-----------------------------------------------------------------------------------------------------------------------------
//  Tiling Generators Constructors
//-----------------------------------------------------------------------------------------------------------------------------

function createGenerators() { /// generators for the tiling by cubes.

    const gen0 = ORIGIN_POSITION.flow(new THREE.Vector3(2. * cubeHalfWidth, 0., 0.)).boost;
    const gen1 = ORIGIN_POSITION.flow(new THREE.Vector3(-2. * cubeHalfWidth, 0., 0.)).boost;
    const gen2 = ORIGIN_POSITION.flow(new THREE.Vector3(0., 2. * cubeHalfWidth, 0.)).boost;
    const gen3 = ORIGIN_POSITION.flow(new THREE.Vector3(0., -2. * cubeHalfWidth, 0.)).boost;
    const gen4 = ORIGIN_POSITION.flow(new THREE.Vector3(0., 0., 2. * cubeHalfWidth)).boost;
    const gen5 = ORIGIN_POSITION.flow(new THREE.Vector3(0., 0., -2. * cubeHalfWidth)).boost;

    //console.log('ORIGIN_POSITION', ORIGIN_POSITION.boost.matrix.elements, ORIGIN_POSITION.facing.elements);
    // var gen0 = translateByVector(new THREE.Vector3(2. * cubeHalfWidth, 0., 0.));
    // var gen1 = translateByVector(new THREE.Vector3(-2. * cubeHalfWidth, 0., 0.));
    // var gen2 = translateByVector(new THREE.Vector3(0., 2. * cubeHalfWidth, 0.));
    // var gen3 = translateByVector(new THREE.Vector3(0., -2. * cubeHalfWidth, 0.));
    // var gen4 = translateByVector(new THREE.Vector3(0., 0., 2. * cubeHalfWidth));
    // var gen5 = translateByVector(new THREE.Vector3(0., 0., -2. * cubeHalfWidth));
    let res =  [gen0, gen1, gen2, gen3, gen4, gen5];
   /* console.log(gen0.matrix.elements);
    console.log(gen1.matrix.elements);
    console.log(gen2.matrix.elements);
    console.log(gen3.matrix.elements);
    console.log(gen4.matrix.elements);
    console.log(gen5.matrix.elements);*/
    return res;
}

function invGenerators(genArr) {
    return [genArr[1], genArr[0], genArr[3], genArr[2], genArr[5], genArr[4]];
}

//Unpackage boosts into their components (for hyperbolic space, just pull out the matrix which is the first component)
function unpackageMatrix(genArr) {
    let out = [];
    for (let i = 0; i < genArr.length; i++) {
        out.push(genArr[i].matrix);
    }
    return out
}

// var unpackage = function (genArr, i) {
//     var out = [];
//     for (var j = 0; j < genArr.length; j++) {
//         out.push(genArr[j][i]);
//     }
//     return out;
// }

//-----------------------------------------------------------------------------------------------------------------------------
//	Initialise things
//-----------------------------------------------------------------------------------------------------------------------------

let invGensMatrices; // need lists of things to give to the shader, lists of types of object to unpack for the shader go here

function initGeometry() {
    //g_currentBoost = [new THREE.Matrix4()];
    g_position = ORIGIN_POSITION.clone();
    //g_facing = new THREE.Matrix4();
    g_cellPosition = ORIGIN_POSITION.clone();
    g_invCellPosition = ORIGIN_POSITION.clone();
    // g_cellBoost = [new THREE.Matrix4()];
    // g_invCellBoost = [new THREE.Matrix4()];
    gens = createGenerators();
    invGens = invGenerators(gens);
    invGensMatrices = unpackageMatrix(invGens);

    let vectorLeft = g_position.rotateByFacing(new THREE.Vector3(-c_ipDist, 0, 0));
    g_leftPosition = ORIGIN_POSITION.flow(vectorLeft);

    let vectorRight = g_position.rotateByFacing(new THREE.Vector3(c_ipDist, 0, 0));
    g_rightPosition = ORIGIN_POSITION.flow(vectorRight);
}


function PointLightObject(v, colorInt) {
    //position is a euclidean Vector4
    let isom = ORIGIN_POSITION.flow(v).boost;
    let lp = isom.translate(ORIGIN);
    lightPositions.push(lp);
    lightIntensities.push(colorInt);
}


//DEFINE THE LIGHT COLORS
const lightColor1 = new THREE.Vector4(68 / 256, 197 / 256, 203 / 256, 1);
const lightColor2 = new THREE.Vector4(252 / 256, 227 / 256, 21 / 256, 1);
const lightColor3 = new THREE.Vector4(245 / 256, 61 / 256, 82 / 256, 1);
const lightColor4 = new THREE.Vector4(256 / 256, 142 / 256, 226 / 256, 1);


function initObjects() {
    PointLightObject(new THREE.Vector3(1., 0, 0), lightColor1);
    PointLightObject(new THREE.Vector3(0, 1., 0), lightColor2);
    PointLightObject(new THREE.Vector3(0, 0, 1.), lightColor3);
    PointLightObject(new THREE.Vector3(-1., -1., -1.), lightColor4);
    globalObjectPosition = ORIGIN_POSITION.flow(new THREE.Vector3(0, -1.0, 0));
    //globalObjectBoost = translateByVector(new THREE.Vector3(0, -1.0, 0));
}

//-------------------------------------------------------
// Set up shader 
//-------------------------------------------------------
// We must unpackage the boost data here for sending to the shader.

function setupMaterial(fShader) {
    //these are the left/right translations, rotations and facing corrections for stereo motion


    /* var preVectorLeft = (new THREE.Vector4(-0.032, 0, 0).applyMatrix4(g_facing));
     var vectorLeft = new THREE.Vector3(preVectorLeft.x, preVectorLeft.y, preVectorLeft.z);

     var preVectorRight = (new THREE.Vector4(0.032, 0, 0).applyMatrix4(g_facing));
     var vectorRight = new THREE.Vector3(preVectorRight.x, preVectorRight.y, preVectorRight.z);


     var leftBoost = translateByVector(vectorLeft);
     var rightBoost = translateByVector(vectorRight);
     var leftFacing = translateFacingByVector(vectorLeft);
     var rightFacing = translateFacingByVector(vectorRight);*/


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
                value: g_position.boost.matrix
            },
            leftBoost: {
                type: "m4",
                value: g_leftPosition.boost.matrix
            },
            rightBoost: {
                type: "m4",
                value: g_rightPosition.boost.matrix
            },
            //currentBoost is an array
            facing: {
                type: "m4",
                value: g_position.facing
            },
            leftFacing: {
                type: "m4",
                value: g_leftPosition.facing
            },
            rightFacing: {
                type: "m4",
                value: g_rightPosition.facing
            },
            cellBoost: {
                type: "m4",
                value: g_cellPosition.boost.matrix
            },
            invCellBoost: {
                type: "m4",
                value: g_invCellPosition.boost.matrix
            },
            cellFacing: {
                type: "m4",
                value: g_cellPosition.facing
            },
            invCellFacing: {
                type: "m4",
                value: g_invCellPosition.facing
            },
            lightPositions: {
                type: "v4",
                value: lightPositions
            },
            globalObjectBoost: {
                type: "m4",
                value: globalObjectPosition.boost.matrix
            }
        },

        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: fShader,
        transparent: true
    });
}
