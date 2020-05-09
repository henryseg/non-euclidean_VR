import {
    Vector3,
    Vector4,
    ShaderMaterial,
    CubeTextureLoader
} from "./module/three.module.js";

import {
    globals
} from './Main.js';
import {
    H2Elt,
    Isometry
} from "./Isometry.js";
import {
    Position,
    ORIGIN
} from "./Position.js";


//----------------------------------------------------------------------------------------------------------------------
//	Geometry constants
//----------------------------------------------------------------------------------------------------------------------


//----------------------------------------------------------------------------------------------------------------------
//	Teleporting back to central cell
//----------------------------------------------------------------------------------------------------------------------

function fixOutsideCentralCell(position) {

    /*
    let bestIndex = -1;
    let p = new Vector4(0, 0, 0, 1).applyMatrix4(position.boost.matrix);
    //lattice basis divided by the norm square
    let v1 = new Vector4(GoldenRatio, -1., 0., 0.);
    let v2 = new Vector4(1., GoldenRatio, 0., 0.);
    let v3 = new Vector4(0., 0., 1. / z0, 0.);


    if (globals.display != 3) { //this turns off the vertical teleporation when there is no vertical syymetries
        if (p.dot(v3) > 0.5) {
            bestIndex = 5;
        }
        if (p.dot(v3) < -0.5) {
            bestIndex = 4;
        }
    }

    if (p.dot(v1) > 0.5) {
        bestIndex = 1;
    }
    if (p.dot(v1) < -0.5) {
        bestIndex = 0;
    }
    if (p.dot(v2) > 0.5) {
        bestIndex = 3;
    }
    if (p.dot(v2) < -0.5) {
        bestIndex = 2;
    }

    if (bestIndex !== -1) {
        position.translateBy(globals.gens[bestIndex]);
        return bestIndex;
    } else {
        return -1;
    }
     */
    return -1;
}




//----------------------------------------------------------------------------------------------------------------------
//  Tiling Generators Constructors
//----------------------------------------------------------------------------------------------------------------------

function createGenerators() { /// generators for the tiling by cubes.

    // TODO. Check the generators
    //  For the moment the elements are chosen totally at random.
    //  Not even sure they generate a discrete subgroup!

    const aux = 1;
    const gen0 = new Isometry().makeLeftTranslation(0, Math.sqrt(aux * aux + 1), aux, 0);
    const gen1 = new Isometry().makeInvLeftTranslation(0, Math.sqrt(aux * aux + 1), aux, 0);
    const gen2 = new Isometry().makeLeftTranslation(0, Math.sqrt(aux * aux + 1), 0, aux);
    const gen3 = new Isometry().makeInvLeftTranslation(0, Math.sqrt(aux * aux + 1), 0, aux);
    const gen4 = new Isometry().makeLeftTranslation(1, 1, 0,0);
    const gen5 = new Isometry().makeInvLeftTranslation(1, 1, 0,0);


    return [gen0, gen1, gen2, gen3, gen4, gen5];
}

function invGenerators(genArr) {
    return [genArr[1], genArr[0], genArr[3], genArr[2], genArr[5], genArr[4]];
}

//Unpackage boosts into their components (for hyperbolic space, just pull out the matrix which is the first component)
function unpackageMatrix(genArr) {
    let out = [];
    for (let i = 0; i < genArr.length; i++) {
        out.push(genArr[i].toVector4());
    }
    return out
}


//----------------------------------------------------------------------------------------------------------------------
//	Initialise things
//----------------------------------------------------------------------------------------------------------------------

let invGensMatrices; // need lists of things to give to the shader, lists of types of object to unpack for the shader go here
const time0 = new Date().getTime();

function initGeometry() {
    globals.position = new Position();
    console.log("During init", globals.position);
    //console.log("position", globals.position.boost);
    //console.log("During init", globals.position.boost.point);
    //console.log("During init", globals.position.boost.point.coord);
    //console.log("SL2",globals.position.boost.toVector4());
    globals.cellPosition = new Position();
    globals.invCellPosition = new Position();
    globals.gens = createGenerators();
    globals.invGens = invGenerators(globals.gens);
    invGensMatrices = unpackageMatrix(globals.invGens);

    //console.log("invGensMatrices", invGensMatrices);


    let vectorLeft = globals.position.getRightVector(-globals.ipDist);
    console.log("vectorLeft", vectorLeft);
    globals.leftPosition = globals.position.clone().localFlow(vectorLeft);

    let vectorRight = globals.position.getRightVector(globals.ipDist);
    console.log("vectorRight", vectorRight);
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
const lightColor1 = new Vector4(68 / 256, 197 / 256, 203 / 256, 1); // blue
const lightColor2 = new Vector4(252 / 256, 227 / 256, 21 / 256, 1); // yellow
const lightColor3 = new Vector4(245 / 256, 61 / 256, 82 / 256, 1); // red
const lightColor4 = new Vector4(256 / 256, 142 / 256, 226 / 256, 1); // purple


function initObjects() {
    PointLightObject(new Vector3(1., 1.5, 0), lightColor1);
    PointLightObject(new Vector3(-1, 1.5, 0), lightColor2);
    PointLightObject(new Vector3(0, 0, 1.), lightColor3);
    PointLightObject(new Vector3(-1., -1., -1.), lightColor4);

    globals.globalObjectPosition = new Position().localFlow(new Vector3(0, 0, -1));
}

//----------------------------------------------------------------------------------------------------------------------
// Set up shader
//----------------------------------------------------------------------------------------------------------------------

function setupMaterial(fShader) {

    // console.log("globals.vr", globals.vr);
    // console.log("globals.lightIntensities", globals.lightIntensities);
    // console.log("invGensMatrices", invGensMatrices);
    // console.log("globals.position.boost.toVector4()", globals.position.boost.toVector4());
    // console.log("globals.leftPosition.boost.toVector4()", globals.leftPosition.boost.toVector4());
    // console.log("globals.rightPosition.boost.toVector4()", globals.rightPosition.boost.toVector4());
    // console.log("globals.position.facing", globals.position.facing);
    // console.log("globals.leftPosition.facing", globals.leftPosition.facing);
    // console.log("globals.rightPosition.facing", globals.rightPosition.facing);
    // console.log("globals.cellPosition.boost.toVector4()", globals.cellPosition.boost.toVector4());
    // console.log("globals.invCellPosition.boost.toVector4()", globals.invCellPosition.boost.toVector4());
    // console.log("globals.cellPosition.facing", globals.cellPosition.facing);
    // console.log("globals.invCellPosition.facing", globals.invCellPosition.facing);
    // console.log("globals.lightPositions", globals.lightPositions);
    // console.log("globals.globalObjectPosition.boost.toVector4()", globals.globalObjectPosition.boost.toVector4());

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
                type: "v4",
                value: invGensMatrices
            },
            //--- end of invGen stuff
            currentBoostMat: {
                type: "v4",
                value: globals.position.boost.toVector4()
            },
            leftBoostMat: {
                type: "v4",
                value: globals.leftPosition.boost.toVector4()
            },
            rightBoostMat: {
                type: "v4",
                value: globals.rightPosition.boost.toVector4()
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
                type: "v4",
                value: globals.cellPosition.boost.toVector4()
            },
            invCellBoostMat: {
                type: "v4",
                value: globals.invCellPosition.boost.toVector4()
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
                type: "v4",
                value: globals.globalObjectPosition.boost.toVector4()
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
            },
            time: {
                type: "f",
                value: (new Date().getTime()) - time0
            },
            display: {
                type: "int",
                value: globals.display
            },
            res: {
                type: "int",
                value: globals.res
            },
            lightRad: {
                type: "float",
                value: globals.lightRad
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

    let vectorLeft = globals.position.getRightVector(-globals.ipDist);
    globals.leftPosition = globals.position.clone().localFlow(vectorLeft);
    globals.material.uniforms.leftBoostMat.value = globals.leftPosition.boost.toVector4();
    globals.material.uniforms.leftFacing.value = globals.leftPosition.facing;

    let vectorRight = globals.position.getRightVector(globals.ipDist);
    globals.rightPosition = globals.position.clone().localFlow(vectorRight);
    globals.material.uniforms.rightBoostMat.value = globals.rightPosition.boost.toVector4();
    globals.material.uniforms.rightFacing.value = globals.rightPosition.facing;

    globals.material.uniforms.time.value = (new Date().getTime()) - time0;

    globals.material.uniforms.display.value = globals.display;
    globals.material.uniforms.res.value = globals.res;
    // globals.material.uniforms.lightRad.value = globals.lightRad;

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
