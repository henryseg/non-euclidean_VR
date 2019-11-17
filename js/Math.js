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


     The style follow the one of three.js :
     Every operation modifies the current object.
     To make a copy of an object, use the clone method.
     Not sure yet what is the right philosophy for the setters.
 */

/*

    Representation of an isometry

    TODO:
     - Add an `applyIsom` method to the class Vector4 ?
     - Same with the rotationByFacing ?

 */

function Isometry() {
    // In the euclidean geometry an Isometry is just a 4x4 matrix.
    // This may change in the H^2 x R case, where we need an additional translation in the z direction


    // By default the return isometry is the identity
    this.matrix = new THREE.Matrix4();

    this.set = function (data) {
        this.matrix = data[0].clone();
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

    // this.multiply = function (isom) {
    //     // return this * isom (which is the "natural order" if you read from left to right)
    //     return this.rightMultiply(isom);
    // };

    this.getInverse = function (isom) {
        // set the current isometry to the inverse of the passed isometry isom,
        this.matrix.getInverse(isom.matrix);
        return this;
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
        return new Isometry().set([this.matrix]);
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
        this.facing.premultiply(isom.matrix);
        // at this point the facing is not correct as it contains the translation part from isom
        // fixed by the line below
        this.facing.setPosition(new THREE.Vector3(0., 0., 0.));
        this.reduceError();
        return this;
    };

    this.localTranslateBy = function (isom) {
        // if we are at boost of b, our position is b.0. We want to fly forward, and isom
        // tells me how to do this if I were at 0. So I want to apply b * isom * b^{-1} to b * 0, and I get b * isom * 0.
        // In other words, translate boost by the conjugate of isom by boost
        // TODO : compute what needs to be done to the facing : simply rotate by boost * isom * boost^{-1} ?
        //  or the local translate should actually be a composition of positions ?
        this.boost.multiply(isom);
        this.reduceBoostError();
        return this;
    };

    this.rotateFacingBy = function (rotation) {
        // apply the given matrix (on the left) to the current facing and return the new result
        this.facing.premultiply(rotation);
        this.reduceFacingError();
        return this;
    };

    this.localRotateFacingBy = function (rotation) {
        // apply the given matrix (on the right) to the current facing and return the new result
        this.facing.multiply(rotation);
        this.reduceFacingError();
        return this;
    };

    this.flow = function (v) {
        // move the position following the geodesic flow
        // the geodesic starts at the origin, its tangent vector is v
        // parallel transport the facing along the geodesic

        // in Euclidean geometry, just apply a translation
        // Nothing to do on the facing
        let matrix = new THREE.Matrix4().makeTranslation(v.x, v.y, v.z);
        let isom = new Isometry().set([matrix]);
        return this.translateBy(isom);
    };

    this.localFlow = function (v) {
        // move the position following the geodesic flow FROM THE POINT WE ARE AT
        // v is the pull back at the origin of the direction we want to follow
        // TODO. Check the facing
        let matrix = new THREE.Matrix4().makeTranslation(v.x, v.y, v.z);
        let isom = new Isometry().set([matrix]);
        return this.localTranslateBy(isom);
    };

    this.rotateByFacing = function (v) {
        // rotate the given vector by the facing
        // TODO: find a better way to go from Vector3 to Vector4 and conversely
        let aux = new THREE.Vector4(v.x, v.y, v.z, 0);
        let preRes = aux.applyMatrix4(this.facing);
        return new THREE.Vector3(preRes.x, preRes.y, preRes.z)
    };

    this.getInverse = function (position) {
        // set the current position to the position that can bring back the passed position to the origin position
        this.boost.getInverse(position.boost);
        this.facing.getInverse(position.facing);
        this.reduceError();
        return this;

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
        return new Position().set(this.boost, this.facing);
    }
}


//----------------------------------------------------------------------
//	Geometry constants
//----------------------------------------------------------------------

// The point representing the origin
const ORIGIN = new THREE.Vector4(0, 0, 0, 1);
const cubeHalfWidth = 0.5;

//-----------------------------------------------------------------------------------------------------------------------------
//	Teleporting back to central cell
//-----------------------------------------------------------------------------------------------------------------------------
function geomDist(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}


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
        position.translateBy(gens[bestIndex]);
        return bestIndex;
    } else {
        return -1;
    }

}

//-----------------------------------------------------------------------------------------------------------------------------
//  Tiling Generators Constructors
//-----------------------------------------------------------------------------------------------------------------------------

function createGenerators() { /// generators for the tiling by cubes.

    const gen0 = new Position().flow(new THREE.Vector3(2. * cubeHalfWidth, 0., 0.)).boost;
    const gen1 = new Position().flow(new THREE.Vector3(-2. * cubeHalfWidth, 0., 0.)).boost;
    const gen2 = new Position().flow(new THREE.Vector3(0., 2. * cubeHalfWidth, 0.)).boost;
    const gen3 = new Position().flow(new THREE.Vector3(0., -2. * cubeHalfWidth, 0.)).boost;
    const gen4 = new Position().flow(new THREE.Vector3(0., 0., 2. * cubeHalfWidth)).boost;
    const gen5 = new Position().flow(new THREE.Vector3(0., 0., -2. * cubeHalfWidth)).boost;

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

    let vectorLeft = g_position.rotateByFacing(new THREE.Vector3(-c_ipDist, 0, 0));
    g_leftPosition = new Position().flow(vectorLeft);

    let vectorRight = g_position.rotateByFacing(new THREE.Vector3(c_ipDist, 0, 0));
    g_rightPosition = new Position().flow(vectorRight);
}


function PointLightObject(v, colorInt) {
    //position is a euclidean Vector4
    let isom = new Position().flow(v).boost;
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
    globalObjectPosition = new Position().flow(new THREE.Vector3(0, -1, 0.));
}

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
            globalObjectBoostMat: {
                type: "m4",
                value: globalObjectPosition.boost.matrix
            },
            globalSphereRad: {
                type: "f",
                value: 0.2
            },
            earthCubeTex: { //earth texture to global object
                type: "",
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

    //g_material.uniform.foo.value = 0;


}
