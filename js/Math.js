// console.log(m) prints column by column, which is not what you expect...
// v.applyMatrix4(m) does m*v
// m.multiply(n) does m*n

let PI = 3.1415926535;
//----------------------------------------------------------------------
//	Object oriented version of the geometry
//----------------------------------------------------------------------
//matrices don't come with addition in JS?!
//adding matrices
THREE.Matrix4.prototype.add = function (m) {
    this.set.apply(this, [].map.call(this.elements, function (c, i) {
        return c + m.elements[i]
    }));
};

/*

    On the JS part
    - Every point is represented by a THREE.Vector4 object,
      whose coordinates corresponds to the coordinates in the appropriate (projective ?) model
    - Every tangent vector at the origin is represented by a THREE.Vector3 object
      i.e. we identify the tangent space at the origin with R^3.


     The style follow the one of three.js :
     Every operation modifies the current object.
     To make a copy of an object, use the clone method.
     Not sure yet what is the right philosophy for the setters.
 */

/*
 * 
 *

    Representation of an isometry

 */





function Isometry() {
    // In the euclidean geometry an Isometry is just a 4x4 matrix.
    // This may change in the H^2 x R case, where we need an additional translation in the z direction


    // By default the return isometry is the identity
    this.matrix = new THREE.Matrix4();

    this.set = function (data) {
        // set the data
        this.matrix = data[0].clone();
        return this;
    };


    this.translateByVector = function (v) {
        let matrix = new THREE.Matrix4().identity();
        let len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

        if (len != 0) {
            var c1 = Math.sinh(len);
            var c2 = Math.cosh(len) - 1;
            let dx = v.x / len;
            let dy = v.y / len;
            let dz = v.z / len;
            var m = new THREE.Matrix4().set(
                0, 0, 0, dx,
                0, 0, 0, dy,
                0, 0, 0, dz,
                dx, dy, dz, 0.0);
            var m2 = m.clone().multiply(m);
            m.multiplyScalar(c1);
            m2.multiplyScalar(c2);
            matrix.add(m);
            matrix.add(m2);
        }
        this.matrix = matrix;
        return this;
    }

    this.makeLeftTranslation = function (v) {
        // return the left translation by (x,y,z)
        // maybe not very useful for the Euclidean geometry, but definitely needed for Nil or Sol
        this.translateByVector(v);
        return this;
    };

    this.makeInvLeftTranslation = function (v) {
        // return the inverse of the left translation by (x,y,z)
        // maybe not very useful for the Euclidean geometry, but definitely needed for Nil or Sol
        this.translateByVector(v.multiplyScalar(-1));
        return this;
    };

    this.premultiply = function (isom) {
        // return the current isometry multiplied on the left by isom, i.e. isom * this
        this.matrix.premultiply(isom.matrix);
        return this;
    };

    this.multiply = function (isom) {
        // return the current isometry multiplied on the left by isom, i.e. this * isom
        this.matrix.multiply(isom.matrix);
        return this;
    };

    this.getInverse = function (isom) {
        // set the current isometry to the inverse of the passed isometry isom,
        this.matrix.getInverse(isom.matrix);
        return this;
    };

    this.equals = function (isom) {
        // test equality of isometries (for debugging purpose mostly)
        return this.matrix.equals(isom.matrix);
    };

    this.clone = function () {
        return new Isometry().set([this.matrix]);
    };
}

/*

    Translating a point by an isometry

 */
THREE.Vector4.prototype.translateBy = function (isom) {
    return this.applyMatrix4(isom.matrix);
};

/*

    Representation of the position of the observer
    A position is given by
    - a `boost` which is an Isometry moving the origin to the point where the observer is
    - a `facing` which determines where the observer is looking at. It is a element of SO(3) encoded as a 4x4 matrix

    More abstractly there is a map from Isom(X) x SO(3) -> Frame bundle, sending (L, A) to  d_o L A f where
    - o is the origin
    - f is a fixed (reference) frame in the tangent space of X at o
    Note that the point stabilizer G_o of o in Isom(X) acts on the set of positions as follows
    (L, A) . U = (LU^{-1},  d_o U A)
    The G_o -orbits of a position is exactly the fiber of the map Isom(X) x SO(3) -> Frame bundle

*/

function Position() {

    // By default the return position is the origin (with the "default" facing - negative z-direction ?)
    this.boost = new Isometry();
    this.facing = new THREE.Matrix4();


    this.setBoost = function (boost) {
        this.boost = boost.clone();
        return this;
    };

    this.setFacing = function (facing) {
        this.facing = facing.clone();
        return this;
    };

    this.set = function (boost, facing) {
        this.setBoost(boost);
        this.setFacing(facing);
        return this;
    };

    this.translateBy = function (isom) {
        // translate the position by the given isometry
        this.boost.premultiply(isom);
        this.reduceError();
        return this;
    };

    this.localTranslateBy = function (isom) {
        // if we are at boost of b, our position is b.0. We want to fly forward, and isom
        // tells me how to do this if I were at 0. So I want to apply b * isom * b^{-1} to b * 0, and I get b * isom * 0.
        // In other words, translate boost by the conjugate of isom by boost
        this.boost.multiply(isom);
        this.reduceBoostError();
        return this;
    };

    /*
    this.rotateFacingBy = function (rotation) {
        // apply the given matrix (on the left) to the current facing and return the new result
        this.facing.premultiply(rotation);
        this.reduceFacingError();
        return this;
    };
    */

    this.localRotateFacingBy = function (rotation) {
        // apply the given matrix (on the right) to the current facing and return the new result
        this.facing.multiply(rotation);
        this.reduceFacingError();
        return this;
    };



    /*
    this.flow = function (v) {
        // move the position following the geodesic flow
        // the geodesic starts at the origin, its tangent vector is v
        // parallel transport the facing along the geodesic

        // in Euclidean geometry, just apply a translation
        // Nothing to do on the facing
        let isom = new Isometry().makeLeftTranslation(v.x, v.y, v.z);
        return this.translateBy(isom);
    };
     */




    this.localFlow = function (v) {
        // move the position following the geodesic flow where
        // v is the pull back at the origin by this.boost of the tangent vector at boost * o

        // Let gamma be the geodesic starting at p = boost * o directed by boost * v
        // Let gamma_o be the geodesic starting at o directed by v, i.e. gamma_o = boost^{-1} gamma
        // The parallel transport along gamma_o is an operator T_o which we split as T_o = dS_o B_o where
        // - S_o is an isometry of X
        // - B_o an element of SO(3)
        // The position after parallel transport along gamma, is (boost * S_o, B_o * facing)

        // In the Euclidean case, S_o is the regular translation, B_o is the identity.

        let isom = new Isometry().translateByVector(v);
        return this.localTranslateBy(isom);
    };


//returns the position of the point stored by state
//really, should be doing this to position and using it here
this.positionPoint = function () {
    return ORIGIN.clone().applyMatrix4(this.boost.matrix.clone());
}


    this.getInverse = function (position) {
        // set the current position to the position that can bring back the passed position to the origin position
        this.boost.getInverse(position.boost);
        this.facing.getInverse(position.facing);
        this.reduceError();
        return this;

    };

    this.getFwdVector = function () {
        // return the vector moving forward (taking into account the facing)
        return new THREE.Vector3(0, 0, -1).rotateByFacing(this);
    };

    this.getRightVector = function () {
        // return the vector moving right (taking into account the facing)
        return new THREE.Vector3(1, 0, 0).rotateByFacing(this);
    };

    this.getUpVector = function () {
        // return the vector moving up (taking into account the facing)
        return new THREE.Vector3(0, 1, 0).rotateByFacing(this);
    };

    this.reduceBoostError = function () {
        // Nothing to do in Euclidean geometry
        return this;
    };

    this.reduceFacingError = function () {
        // Gram-Schmidt
        let col0 = new THREE.Vector4(1, 0, 0, 0).applyMatrix4(this.facing);
        let col1 = new THREE.Vector4(0, 1, 0, 0).applyMatrix4(this.facing);
        let col2 = new THREE.Vector4(0, 0, 1, 0).applyMatrix4(this.facing);

        col0.normalize();

        let aux10 = col0.clone().multiplyScalar(col0.dot(col1));
        col1.sub(aux10).normalize();

        let aux20 = col0.clone().multiplyScalar(col0.dot(col2));
        let aux21 = col1.clone().multiplyScalar(col1.dot(col2));
        col2.sub(aux20).sub(aux21).normalize();

        this.facing.set(
            col0.x, col1.x, col2.x, 0.,
            col0.y, col1.y, col2.y, 0.,
            col0.z, col1.z, col2.z, 0.,
            0., 0., 0., 1.
        );
        return this;
    };

    this.reduceError = function () {
        this.reduceBoostError();
        this.reduceFacingError();
        return this;
    };

    this.equals = function (position) {
        // test equality of isometries (for debugging purpose mostly)
        return (this.boost.equals(position.boost) && this.facing.equals(position.facing));
    };

    this.clone = function () {
        return new Position().set(this.boost, this.facing);
    }
}







/*

    Rotating a vector

 */

THREE.Vector3.prototype.rotateByFacing = function (position) {
    let aux = new THREE.Vector4(this.x, this.y, this.z, 0).applyMatrix4(position.facing);
    this.set(aux.x, aux.y, aux.z);
    return this;
};


//----------------------------------------------------------------------
//	Geometry constants
//----------------------------------------------------------------------

// The point representing the origin
const ORIGIN = new THREE.Vector4(0, 0, 0, 1);
var cubeHalfWidth = 0.6584789485;
var modelHalfCube = 0.5773502692;

function edist(state1, state2) {
    var sp1 = state1.boost.matrix.elements;
    var sp2 = state2.boost.matrix.elements;
    return Math.sqrt((sp2[12] - sp1[12]) * (sp2[12] - sp1[12]) + (sp2[13] - sp1[13]) * (sp2[13] - sp1[13]) + (sp2[14] - sp1[14]) * (sp2[14] - sp1[14]))
}

//-----------------------------------------------------------------------------------------------------------------------------
//	Teleporting back to central cell
//-----------------------------------------------------------------------------------------------------------------------------
//return distance of a point p from the origin;
function geomDist(v) {
    return Math.acosh(v.w);
}

function modelProject(v) {
    return new THREE.Vector3(v.x / v.w, v.y / v.w, v.z / v.w);
}

//
//function geomDistance(v) {
//    return Math.acosh(v.w);
//}


//returns the tangent vector at the origin which points to P in the model of the geometry
function tangDirection(p) {
    direction = p.sub(ORIGIN.clone().multiplyScalar(p.w));
    direction = direction.normalize();
    return direction;
}




function fixOutsideCentralCell(position) {
    let cPos = ORIGIN.clone().translateBy(position.boost);
    let mPos = modelProject(cPos);
    let bestIndex = -1;

    if (cPos.z > cubeHalfWidth) {
        bestIndex = 5;
    } else if (mPos.z < -modelHalfCube) {
        bestIndex = 4;
    } else if (mPos.x > modelHalfCube) {
        bestIndex = 1;
    } else if (mPos.x < -modelHalfCube) {
        bestIndex = 0;
    } else if (mPos.y > modelHalfCube) {
        bestIndex = 3;
    } else if (mPos.y < -modelHalfCube) {
        bestIndex = 2;
    }

    if (bestIndex !== -1) {
        position.translateBy(gens[bestIndex]);
        return bestIndex;
    } else {
        return -1;
    }

}



//function fixOutsideCentralCell(position) {
//    let cPos = ORIGIN.clone().translateBy(position.boost);
//    let bestDist = geomDistance(cPos);
//    let bestIndex = -1;
//    for (let i = 0; i < gens.length; i++) {
//        let pos = cPos.clone().translateBy(gens[i]);
//        let dist = geomDistance(pos);
//        if (dist < bestDist) {
//            bestDist = dist;
//            bestIndex = i;
//        }
//    }
//    if (bestIndex !== -1) {
//        position.translateBy(gens[bestIndex]);
//        return bestIndex;
//    } else {
//        return -1;
//    }
//
//}

//-----------------------------------------------------------------------------------------------------------------------------
//  Tiling Generators Constructors
//-----------------------------------------------------------------------------------------------------------------------------

function createGenerators() { /// generators for the tiling by cubes.

    let gen0 = new Isometry().translateByVector(new THREE.Vector3(2. * cubeHalfWidth, 0., 0.));
    //Position().flow(new THREE.Vector3(2. * cubeHalfWidth, 0., 0.)).boost;
    let gen1 = new Isometry().translateByVector(new THREE.Vector3(-2. * cubeHalfWidth, 0., 0.));
    let gen2 = new Isometry().translateByVector(new THREE.Vector3(0., 2. * cubeHalfWidth, 0.));
    let gen3 = new Isometry().translateByVector(new THREE.Vector3(0., -2. * cubeHalfWidth, 0.));
    let gen4 = new Isometry().translateByVector(new THREE.Vector3(0., 0., 2. * cubeHalfWidth));
    let gen5 = new Isometry().translateByVector(new THREE.Vector3(0., 0., -2. * cubeHalfWidth));

    //ADD ROTATIONS TO THE SIDE IDENTIFICATIONS TO MAKE INTO A MANIFOLD

    gen0.multiply(new Isometry().set([new THREE.Matrix4().makeRotationX(-PI / 2).transpose()]));

    gen1.multiply(new Isometry().set([new THREE.Matrix4().makeRotationX(PI / 2).transpose()]));

    gen2.multiply(new Isometry().set([new THREE.Matrix4().makeRotationY(-PI / 2).transpose()]));

    gen3.multiply(new Isometry().set([new THREE.Matrix4().makeRotationY(PI / 2).transpose()]));

    gen4.multiply(new Isometry().set([new THREE.Matrix4().makeRotationZ(-PI / 2).transpose()]));

    gen5.multiply(new Isometry().set([new THREE.Matrix4().makeRotationZ(PI / 2).transpose()]));


    //these generators do generate the tiling, but don't give a manifold.  need to also twist as we glue opposing faces correctly
    //Need to add in rotation to the generators.

    return [gen0, gen1, gen2, gen3, gen4, gen5];
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


//-----------------------------------------------------------------------------------------------------------------------------
//	Initialise things
//-----------------------------------------------------------------------------------------------------------------------------

let invGensMatrices; // need lists of things to give to the shader, lists of types of object to unpack for the shader go here

function initGeometry() {
    g_position = new Position();
    g_cellPosition = new Position();
    g_invCellPosition = new Position();
    gens = createGenerators();
    invGens = invGenerators(gens);
    invGensMatrices = unpackageMatrix(invGens);

    let vectorLeft = new THREE.Vector3(-c_ipDist, 0, 0).rotateByFacing(g_position);
    g_leftPosition = g_position.clone().localFlow(vectorLeft);

    let vectorRight = new THREE.Vector3(c_ipDist, 0, 0).rotateByFacing(g_position);
    g_rightPosition = g_position.clone().localFlow(vectorRight);
}


let numLights = 4;
let localLightIntensity;

function PointLightObject(v, colorInt) {
    //position is a euclidean Vector4
    let isom = new Position().localFlow(v).boost;
    let lp = ORIGIN.clone().translateBy(isom);
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
    

    earthState = new State().setVelocity(new THREE.Vector3(0, 0, 0)).setAngular(new THREE.Vector3(0, -3, 0)).setMass(81);

    earthState.setBoost(new Position().localFlow(new THREE.Vector3(0, 0, -1)).boost);

    moonState = new State().setVelocity(new THREE.Vector3(10, 4, 2)).setAngular(new THREE.Vector3(0, -3, 0)).setMass(1);

    moonState.setBoost(new Position().localFlow(new THREE.Vector3(-1, -0.5, -1)).boost);

    sunState = new State().setVelocity(new THREE.Vector3(0, 0, 0)).setAngular(new THREE.Vector3(0, 10, 0));

    sunState.setBoost(new Position().localFlow(new THREE.Vector3(1.5, 0, -2)).boost);
    
    
    
    //MUST BE INSIDE ORIGINAL FUNDAMENTAL DOMAIN
    localEarthState=new State().setBoost(new Position().localFlow(new THREE.Vector3(-0.3,0,-0.2)).boost).setAngular(new THREE.Vector3(0,1,0));
    
    localLightPos= new Position().localFlow(new THREE.Vector3(0,0.4,0.3));

    //    globalObjectState = new State().setVelocity(
    //        new THREE.Vector3(0, 0, -1));

    //    globalObjectState = new State().setVelocity(new THREE.Vector3(0, 0, -1)).setAngular(new THREE.Vector3(0, -3, 0));
    //    //velocity is into screen
    //    //ang velocity is about y axis (earth's poles)


}


////Spin the Local Earth
stepSize = 0.001;
setInterval(function () {
localEarthState.localFlow(stepSize);},10);
//
//////MOVE THE PLANETS AROUND
//stepSize = 0.001;
//setInterval(function () {
//
//        if (edist(earthState, moonState) > .27) {
//            earthState.localFlow(stepSize);
//            moonState.localFlow(stepSize);
//        } else {
//            console.log('impact');
//            w1 = earthState.clone().tangDirectionTo(moonState).multiplyScalar(.2);
//            w2 = moonState.clone().tangDirectionTo(earthState).multiplyScalar(.2);
//            vecw1 = new THREE.Vector3(w1.x, w1.y, w1.z);
//            vecw2 = new THREE.Vector3(w2.x, w2.y, w2.z);
//            midp = earthState.clone().translateBy(new Isometry().translateByVector(vecw1));
//            ms1 = earthState.clone().flowBy(w1.multiplyScalar(.2));
//            ms2 = moonState.clone().flowBy(w2.multiplyScalar(.2));
//            mtang = (midp.clone().tangDirectionTo(earthState)).normalize();
//            ms1par = mtang.clone().multiplyScalar(ms1.velocity.clone().dot(mtang));
//            ms1perp = ms1.velocity.clone().sub(ms1par);
//            ms2par = mtang.clone().multiplyScalar(ms2.velocity.clone().dot(mtang));
//            ms2perp = ms2.velocity.clone().sub(ms2par);
//            check1 = ms1par.clone().multiplyScalar((earthState.mass - moonState.mass) / (earthState.mass + moonState.mass));
//            check2 = ms2par.clone().multiplyScalar(2. * moonState.mass / (earthState.mass + moonState.mass));
//            check3 = ms2par.clone().multiplyScalar((moonState.mass - earthState.mass) / (earthState.mass + moonState.mass));
//            check4 = ms1par.clone().multiplyScalar(2. * earthState.mass / (earthState.mass + moonState.mass));
//            ms1parm = check1.clone().add(check2);
//            ms2parm = check3.clone().add(check4);
//            ms1newvel = ms1perp.clone().add(ms1parm);
//            ms2newvel = ms2perp.clone().add(ms2parm);
//            ms1.velocity.set(ms1newvel.x, ms1newvel.y, ms1newvel.z);
//            ms2.velocity.set(ms2newvel.x, ms2newvel.y, ms2newvel.z);
//            s1back = ms1.clone().flowBy(w1.multiplyScalar(-.2));
//            s2back = ms2.clone().flowBy(w2.multiplyScalar(-.2));
//            earthState.setVelocity(s1back.velocity);
//            moonState.setVelocity(s2back.velocity);
//            earthState.setVelocity(s1back.velocity);
//            moonState.setVelocity(s2back.velocity);
//            earthState.localFlow(stepSize);
//            moonState.localFlow(stepSize);
//        }
//
//
//
//
//
//
//        // var evel=earthState.velocity;
//        // var mvel=moonState.velocity;
//        // earthState.setVelocity(mvel);
//        // moonState.setVelocity(evel);
//        // earthState.localFlow(stepSize);
//        // moonState.localFlow(stepSize); 
//
//        //earthState.localFlow(stepSize);
//        //moonState.localFlow(stepSize);
//        //sunState.localFlow(stepSize);
//
//        // console.log(globalObjectState.boost.matrix.elements);
//    }, 10 // run 100 times a second.
//);

//-------------------------------------------------------
// Set up shader
//-------------------------------------------------------
// We must unpackage the boost data here for sending to the shader.

function setupMaterial(fShader) {

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
                value: g_position.boost.matrix
            },
            leftBoostMat: {
                type: "m4",
                value: g_leftPosition.boost.matrix
            },
            rightBoostMat: {
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
            cellBoostMat: {
                type: "m4",
                value: g_cellPosition.boost.matrix
            },
            invCellBoostMat: {
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
            numLights: {
                type: "i",
                value: numLights
            },

            centerSphereRad: {
                type: "f",
                value: 1.
            },
            vertexSphereRad: {
                type: "f",
                value: -0.98
            },

            earthBoostMat: {
                type: "m4",
                value: earthState.boost.matrix
            },

            earthFacing: {
                type: "m4",
                value: earthState.facing
            },

            earthRad: {
                type: "f",
                value: 0.2
            },

            moonBoostMat: {
                type: "m4",
                value: moonState.boost.matrix
            },

            moonFacing: {
                type: "m4",
                value: moonState.facing
            },

            moonRad: {
                type: "f",
                value: 0.07
            },

            sunBoostMat: {
                type: "m4",
                value: sunState.boost.matrix
            },

            sunFacing: {
                type: "m4",
                value: sunState.facing
            },


            sunRad: {
                type: "f",
                value: 1.
            },

            localEarthBoostMat: {
                type: "m4",
                value: localEarthState.boost.matrix
            },

            localEarthFacing: {
                type: "m4",
                value: localEarthState.facing
            },

            localEarthRad: {
                type: "f",
                value: 0.4
            },

            localLightPos: {
                type: "v4",
                value: ORIGIN.clone().translateBy(localLightPos.boost)
            },
            localLightIntensity: {
                type: "f",
                value: 0.2
            },
            
            
            
            modelHalfCube: {
                type: "f",
                value: modelHalfCube
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
            },
            moonCubeTex: { //texture to global object
                type: "t",
                value: new THREE.CubeTextureLoader().setPath('images/moon/')
                    .load([ //Cubemap derived Arnaud Cheritat's website pics
                    'posx.png',
                    'negx.png',
                    'posy.png',
                    'negy.png',
                    'posz.png',
                    'negz.png'
                ])
            },
            sunCubeTex: { //texture to global object
                type: "",
                value: new THREE.CubeTextureLoader().setPath('images/sun/')
                    .load([ //Cubemap derived Arnaud Cheritat's website pics
                    'posx.png',
                    'negx.png',
                    'posy.png',
                    'negy.png',
                    'posz.png',
                    'negz.png'
                ])
            },
            stereoScreenOffset: {
                type: "f",
                value: g_stereoScreenOffset
            }
        },

        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: fShader,
        transparent: true
    });
}


function updateMaterial() {
    /*
        It seems that to be properly passed to the shader,
        a uniform `foo` cannot be updated on the js side by a statement of the form
        > foo = new_value_of_foo
        One has to use a statement that alter the object `foo` e.g.
        > foo. attribute = new_value of the attribute
        (Maybe some subtleties in the pointer management ?)

        This can be an issue when passing float to the shader
        (Remark: is foo += 1 totally equivalent to foo = foo + 1 in this context?)
        This method is called each time `animate` is used (at every frame ?) and can be used to update uniforms
        > g_material.uniforms.foo.value = new_value_of_foo

     */

    //console.log('ipDist', ipDist);
    let vectorLeft = new THREE.Vector3(-ipDist, 0, 0).rotateByFacing(g_position);
    g_leftPosition = g_position.clone().localFlow(vectorLeft);
    g_material.uniforms.leftBoostMat.value = g_leftPosition.boost.matrix;
    g_material.uniforms.leftFacing.value = g_leftPosition.facing;

    let vectorRight = new THREE.Vector3(ipDist, 0, 0).rotateByFacing(g_position);
    g_rightPosition = g_position.clone().localFlow(vectorRight);
    g_material.uniforms.rightBoostMat.value = g_rightPosition.boost.matrix;
    g_material.uniforms.rightFacing.value = g_rightPosition.facing;


    g_material.uniforms.earthBoostMat.value = earthState.boost.matrix;
    g_material.uniforms.earthFacing.value = earthState.facing;
    
    g_material.uniforms.localEarthFacing.value=localEarthState.facing;

    g_material.uniforms.moonBoostMat.value = moonState.boost.matrix;
    g_material.uniforms.moonFacing.value = moonState.facing;

    g_material.uniforms.sunBoostMat.value = sunState.boost.matrix;
    g_material.uniforms.sunFacing.value = sunState.facing;
    


}
