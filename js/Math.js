import {
    Vector3,
    Vector4,
    ShaderMaterial,
    CubeTextureLoader
} from "./module/three.module.js";

import {globals} from './Main.js';

import {Isometry} from "./Isometry.js";
import {Position, ORIGIN} from "./Position.js";

//----------------------------------------------------------------------------------------------------------------------
//	Geometry constants
//----------------------------------------------------------------------------------------------------------------------

// The point representing the origin
let cubeHalfWidth = 0.5;

//----------------------------------------------------------------------------------------------------------------------
//	Teleporting back to central cell
//----------------------------------------------------------------------------------------------------------------------

function geomDist(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function fixOutsideCentralCell(position) {
    let cPos = ORIGIN.clone().translateBy(position.boost);
    let bestDist = geomDist(cPos);
    let bestIndex = -1;
    for (let i = 0; i < globals.gens.length; i++) {
        let pos = cPos.clone().translateBy(globals.gens[i]);
        let dist = geomDist(pos);
        if (dist < bestDist) {
            bestDist = dist;
            bestIndex = i;
        }
    }
    if (bestIndex !== -1) {
        position.translateBy(globals.gens[bestIndex]);
        return bestIndex;
    } else {
        return -1;
    }

}

//----------------------------------------------------------------------------------------------------------------------
//  Tiling Generators Constructors
//----------------------------------------------------------------------------------------------------------------------

function createGenerators() { /// generators for the tiling by cubes.

    const gen0 = new Isometry().makeLeftTranslation(2. * cubeHalfWidth, 0., 0.);
    const gen1 = new Isometry().makeLeftTranslation(-2. * cubeHalfWidth, 0., 0.);
    const gen2 = new Isometry().makeLeftTranslation(0., 2. * cubeHalfWidth, 0.);
    const gen3 = new Isometry().makeLeftTranslation(0., -2. * cubeHalfWidth, 0.);
    const gen4 = new Isometry().makeLeftTranslation(0., 0., 2. * cubeHalfWidth);
    const gen5 = new Isometry().makeLeftTranslation(0., 0., -2. * cubeHalfWidth);

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


//----------------------------------------------------------------------------------------------------------------------
//	Initialise things
//----------------------------------------------------------------------------------------------------------------------

let invGensMatrices; // need lists of things to give to the shader, lists of types of object to unpack for the shader go here


function initGeometry() {
    globals.position = new Position();
    globals.cellPosition = new Position();
    globals.invCellPosition = new Position();
    globals.gens = createGenerators();
    globals.invGens = invGenerators(globals.gens);
    invGensMatrices = unpackageMatrix(globals.invGens);

    let vectorLeft = new Vector3(-globals.ipDist, 0, 0).rotateByFacing(globals.position);
    globals.leftPosition = globals.position.clone().localFlow(vectorLeft);

    let vectorRight = new Vector3(globals.ipDist, 0, 0).rotateByFacing(globals.position);
    globals.rightPosition = globals.position.clone().localFlow(vectorRight);
}


function PointLightObject(v, colorInt) {
    //position is a euclidean Vector4
    let isom = new Position().localFlow(v).boost;
    let lp = ORIGIN.clone().translateBy(isom);
    globals.lightPositions.push(lp);
    globals.lightIntensities.push(colorInt);
}


//DEFINE THE LIGHT COLORS
const lightColor1 = new Vector4(68 / 256, 197 / 256, 203 / 256, 1);
const lightColor2 = new Vector4(252 / 256, 227 / 256, 21 / 256, 1);
const lightColor3 = new Vector4(245 / 256, 61 / 256, 82 / 256, 1);
const lightColor4 = new Vector4(256 / 256, 142 / 256, 226 / 256, 1);


function initObjects() {
    PointLightObject(new Vector3(1., 0, 0), lightColor1);
    PointLightObject(new Vector3(0, 1., 0), lightColor2);
    PointLightObject(new Vector3(0, 0, 1.), lightColor3);
    PointLightObject(new Vector3(-1., -1., -1.), lightColor4);
    globals.globalObjectPosition = new Position().localFlow(new Vector3(0, 0, -1.));
}

//----------------------------------------------------------------------------------------------------------------------
// Set up shader
//----------------------------------------------------------------------------------------------------------------------

// We must unpackage the boost data here for sending to the shader.

function setupMaterial(fShader) {

    globals.material = new ShaderMaterial({
        uniforms: {

            isStereo: {
                type: "bool",
                value: globals.vr
            },
            screenResolution: {
                type: "v2",
                value: globals.screenResolution
            },
            lightIntensities: {
                type: "v4",
                value: globals.lightIntensities
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
                value: globals.position.boost.matrix
            },
            leftBoostMat: {
                type: "m4",
                value: globals.leftPosition.boost.matrix
            },
            rightBoostMat: {
                type: "m4",
                value: globals.rightPosition.boost.matrix
            },
            //currentBoost is an array
            facing: {
                type: "m4",
                value: globals.position.facing
            },
            leftFacing: {
                type: "m4",
                value: globals.leftPosition.facing
            },
            rightFacing: {
                type: "m4",
                value: globals.rightPosition.facing
            },
            cellBoostMat: {
                type: "m4",
                value: globals.cellPosition.boost.matrix
            },
            invCellBoostMat: {
                type: "m4",
                value: globals.invCellPosition.boost.matrix
            },
            cellFacing: {
                type: "m4",
                value: globals.cellPosition.facing
            },
            invCellFacing: {
                type: "m4",
                value: globals.invCellPosition.facing
            },
            lightPositions: {
                type: "v4",
                value: globals.lightPositions
            },
            globalObjectBoostMat: {
                type: "m4",
                value: globals.globalObjectPosition.boost.matrix
            },
            globalSphereRad: {
                type: "f",
                value: 0.2
            },
            earthCubeTex: { //earth texture to global object
                type: "t",
                value: new CubeTextureLoader().setPath('images/cubemap512/')
                    .load([ //Cubemap derived from http://www.humus.name/index.php?page=Textures&start=120
                        'posx.jpg',
                        'negx.jpg',
                        'posy.jpg',
                        'negy.jpg',
                        'posz.jpg',
                        'negz.jpg'
                    ])
            },
            modelHalfCube: {
                type: "f",
                value: 0.5
            },
            stereoScreenOffset: {
                type: "f",
                value: globals.stereoScreenOffset
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

    let vectorLeft = new Vector3(-globals.ipDist, 0, 0).rotateByFacing(globals.position);
    globals.leftPosition = globals.position.clone().localFlow(vectorLeft);
    globals.material.uniforms.leftBoostMat.value = globals.leftPosition.boost.matrix;
    globals.material.uniforms.leftFacing.value = globals.leftPosition.facing;

    let vectorRight = new Vector3(globals.ipDist, 0, 0).rotateByFacing(globals.position);
    globals.rightPosition = globals.position.clone().localFlow(vectorRight);
    globals.material.uniforms.rightBoostMat.value = globals.rightPosition.boost.matrix;
    globals.material.uniforms.rightFacing.value = globals.rightPosition.facing;


}

export {
    initGeometry,
    initObjects,
    setupMaterial,
    updateMaterial,
    fixOutsideCentralCell,
    createGenerators,
    invGenerators,
    unpackageMatrix
};